// @flow
import type { Express } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import globby from 'globby';
import session from 'express-session';
import path from 'path';
import passport from 'passport';
import configurePassport from './utils/configurePassport';
import AppDevUtils from './utils/AppDevUtils';

class API {
  express: Express;

  sessionMiddleware = session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET,
  });

  constructor() {
    this.express = express();
    this.middleware();
    this.routes();
  }

  middleware(): void {
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));
    this.express.use(this.sessionMiddleware);

    configurePassport(passport);
    this.express.use(passport.initialize());
    this.express.use(passport.session());

    this.express.use(cors({
      origin: AppDevUtils.isDevelopment ? true : /\.cornellappdev\.com/,
      credentials: true,
    }));
  }

  routes(): void {
    const registered = [];

    /* eslint-disable global-require */
    // Connect all routers in ./routers/v2
    const opts2 = { cwd: path.join(__dirname, 'routers/v2') };
    globby.sync(['**/*Router.js'], opts2).forEach((file) => {
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
