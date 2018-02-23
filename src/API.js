// @flow
import type { Express } from 'express';
import bodyParser from 'body-parser';
import express from 'express';
import globby from 'globby';
import path from 'path';

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
    if (process.env.NODE_ENV !== 'production') {
      this.express.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers',
          'Origin, X-Requested-With, Content-Type, Accept');
        next();
      });
    }
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
