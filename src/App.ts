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
import ClassesRouter from './routes/classes';

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
    // Setting path for frontend files.
    this.express.use(express.static(path.join(__dirname, '/../public')));
  }

  // Configure API endpoints.
  private routes(): void {
    this.express.use('/api/v1/', IndexRouter);
    this.express.use('/api/v1/auth/', AuthRouter);
    this.express.use('/api/v1/classes/', ClassesRouter);
  }

}

export default new App().express;
