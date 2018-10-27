// @flow
import type { Express } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import globby from 'globby';
import path from 'path';
import passport from 'passport';
import googlePassport from 'passport-google-oauth20';
import OAuth2Client from 'google-auth-library';
import lib from './utils/Lib';
import UsersRepo from './repos/UsersRepo';
import UserSessionsRepo from './repos/UserSessionsRepo';

class API {
  express: Express;

  constructor() {
      this.express = express();
      this.middleware();
      this.auth();
      this.routes();
  }

  middleware(): void {
      this.express.use(bodyParser.json());
      this.express.use(bodyParser.urlencoded({ extended: false }));

      this.express.use(cors());
  }

  auth(): void {
      const GoogleStrategy = googlePassport.Strategy;
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

      passport.serializeUser((user, done) => {
          done(null, user);
      });

      passport.deserializeUser((user, done) => {
          done(null, user);
      });

      dotenv.config();
      passport.use(new GoogleStrategy({
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.GOOGLE_REDIRECT_URI,
      },
      (async (accessToken, refreshToken, profile, done) => {
          let user = await UsersRepo.getUserByGoogleId(profile.id);
          if (!user) {
              user = await UsersRepo.createUser(profile);
          }
          const session = await UserSessionsRepo
              .createOrUpdateSession(user, accessToken, refreshToken);
          const response = {
              accessToken: session.sessionToken,
              refreshToken: session.updateToken,
              sessionExpiration: session.expiresAt,
              isActive: session.isActive,
          };
          return done(null, response);
      })));

      this.express.use(passport.initialize());
      this.express.use(passport.session());

      this.express.get('/auth/google',
          passport.authenticate('google', { scope: ['profile', 'email'] }));
      this.express.get('/auth/google/callback',
          passport.authenticate('google', { failureRedirect: '/error' }),
          (req, res) => {
              const r = { success: true, data: req.user };
              res.json(r);
          });
      this.express.post('/auth/refresh', lib.updateSession, (req, res) => {
          const r = { success: true, data: req.session };
          res.json(r);
      });
      this.express.get('/error',
          (req, res) => res.send('Error authenticating!'));
      this.express.post('/api/v2/auth/mobile', async (req, res) => {
          client.verifyIdToken({
              idToken: req.body.token,
              audience: process.env.GOOGLE_CLIENT_ID,
          })
              .then(login => sendResponse())
              .catch((error) => {
                  res.redirect('/error');
              });
          async function sendResponse() {
              const googleId = req.body.userId;
              const first = req.body.givenName;
              const last = req.body.familyName;
              const { email } = req.body;

              let user = await UsersRepo.getUserByGoogleId(googleId);
              if (!user) {
                  user = await UsersRepo.createUserWithFields(googleId, first, last,
                      email);
              }

              const session = await UserSessionsRepo
                  .createOrUpdateSession(user, null, null);
              const response = {
                  accessToken: session.sessionToken,
                  refreshToken: session.updateToken,
                  sessionExpiration: session.expiresAt,
                  isActive: session.isActive,
              };
              res.json({ success: true, data: response });
          }
      });
  }

  routes(): void {
      const registered = [];

      // Connect all routers in ./routers/v1
      /* eslint-disable global-require */
      const opts = { cwd: path.join(__dirname, 'routers/v1') };
      globby.sync(['**/*Router.js'], opts).forEach((file) => {
      // All v2 routes
          const router = require(`./routers/v1/${file}`).default;

          registered.push(...router.stack
              .filter(r => r.route)
              .map(r => `/api/v1${r.route.path}`));

          this.express.use('/api/v1', router);
      });

      // Connect all routers in ./routers/v2
      const opts2 = { cwd: path.join(__dirname, 'routers/v2') };
      globby.sync(['**/*Router.js'], opts2).forEach((file) => {
      // All v2 routes
          const router = require(`./routers/v2/${file}`).default;

          registered.push(...router.stack
              .filter(r => r.route)
              .map(r => `/api/v2${r.route.path}`));

          this.express.use('/api/v2', router);
      });
      /* eslint-disable global-require */

      // Fallback prints all registered routes
      if (process.env.NODE_ENV !== 'production') {
          this.express.get('*', (req, res, next) => {
              res.send(`Registered:\n${registered.join('\n')}`);
          });
      }
  }
}

export default API;
