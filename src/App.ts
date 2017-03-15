import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
import * as express from 'express';
import * as session from 'express-session';
import * as passport from 'passport';
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
    dotenv.config();
    this.express = express();
    this.middleware();
    this.routes();
  }

  // Configure Express middleware.
  private middleware(): void {
    this.express.use(logger('dev'));
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));
    this.express.use(cookieParser());
    this.express.use(session({
      secret: '~~clicker secret~~',
      resave: true,
      saveUninitialized: true
    }));
    this.express.use(passport.initialize());
    this.express.use(passport.session());
  }

  // Configure API endpoints.
  private routes(): void {
    this.express.use('/', IndexRouter);
    this.express.use('/auth/', AuthRouter);
  }

}

export default new App().express;
