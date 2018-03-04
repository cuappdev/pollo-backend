// @flow
import type { Express } from 'express';
import bodyParser from 'body-parser';
import express from 'express';
import globby from 'globby';
import path from 'path';
import cors from 'cors';

class API {
  express: Express;

  constructor () {
    this.express = express();
    this.middleware();
    this.routes();
  }

  middleware (): void {
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));

    const whitelist = ['http://pollo.cornellappdev.com', 'https://pollo.cornellappdev.com'];
    const corsOptions = {
      origin: (origin, callback) => {
        if (whitelist.indexOf(origin) !== -1) {
          callback(null, true)
        } else {
          callback(new Error('Not allowed by CORS'))
        }
      }
    }
    this.express.use(cors(corsOptions));
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
