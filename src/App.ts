import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
import * as express from 'express';
import * as path from 'path';
import * as logger from 'morgan';

// Our routes files
import IndexRouter from './routes/index';
import AuthRouter from './routes/auth';

// Creates and configures an ExpressJS web server.
class App {

  // ref to Express instance
  public express: express.Application;

  //Run configuration methods on the Express instance.
  constructor() {
    this.express = express();
    this.middleware();
    this.routes();
    dotenv.config();
  }

  // Configure Express middleware.
  private middleware(): void {
    this.express.use(logger('dev'));
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));
    this.express.use(cookieParser());
  }

  // Configure API endpoints.
  private routes(): void {
    this.express.use('/', IndexRouter);
    this.express.use('/auth/', AuthRouter);
  }

}

export default new App().express;
