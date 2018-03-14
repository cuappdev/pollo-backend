// @flow
import type { Express } from 'express';
import bodyParser from 'body-parser';
import express from 'express';
import globby from 'globby';
import path from 'path';
import cors from 'cors';
import passport from 'passport';
import UsersRepo from './repos/UsersRepo';
import SessionsRepo from './repos/SessionsRepo';
import dotenv from 'dotenv';

class API {
  express: Express;

  constructor () {
    this.express = express();
    this.middleware();
    this.auth();
    this.routes();
  }

  middleware (): void {
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));

    const whitelist = [
      'http://pollo.cornellappdev.com',
      'https://pollo.cornellappdev.com',
      'http://localhost:3000',
      'http://localhost:8080'
    ];

    const corsOptions = {
      origin: (origin, callback) => {
        if (whitelist.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      preflightContinue: false,
      optionsSuccessStatus: 204
    };

    this.express.use(cors());
  }

  auth (): void {
    const GoogleStrategy = require('passport-google-oauth20').Strategy;

    passport.serializeUser(function (user, done) {
      done(null, user);
    });

    passport.deserializeUser(function (user, done) {
      done(null, user);
    });

    dotenv.config();
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URI
    },
    async function (accessToken, refreshToken, profile, done) {
      var user = await UsersRepo.getUserByGoogleId(profile.id);
      if (!user) {
        user = await UsersRepo.createUser(profile);
      }
      const session = await SessionsRepo
        .createOrUpdateSession(user, accessToken, refreshToken);
      const response = {
        accessToken: session.sessionToken,
        refreshToken: session.updateToken,
        sessionExpiration: session.expiresAt,
        isActive: session.isActive
      };
      return done(null, response);
    }
    ));

    this.express.use(passport.initialize());
    this.express.use(passport.session());

    this.express.get('/auth/google',
      passport.authenticate('google', { scope: ['profile', 'email'] }));
    this.express.get('/auth/google/callback',
      passport.authenticate('google', { failureRedirect: '/error' }),
      function (req, res) {
        const r = {success: true, data: req.user};
        res.json(r);
      });
    this.express.get('/error',
      (req, res) => res.send('Error authenticating!'));
  }

  routes (): void {
    const registered = [];

    // Connect all routers in ./routers
    const opts = { cwd: path.join(__dirname, 'routers') };
    globby.sync(['**/*Router.js'], opts).forEach(file => {
      const router = require('./routers/' + file).default;

      registered.push(...router.stack
        .filter(r => r.route)
        .map(r => `/api/v1${r.route.path}`));

      this.express.use('/api/v1', router);
    });

    // Fallback prints all registered routes
    if (process.env.NODE_ENV !== 'production') {
      this.express.get('*', (req, res, next) =>
        res.send(`Registered:\n${registered.join('\n')}`));
    }
  }
}

export default API;
