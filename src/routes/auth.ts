/**
 * Endpoints handling user authentication and update.
 */
import * as Promise from 'bluebird';
import {Router, Request, Response, NextFunction} from 'express';
import * as passport from 'passport';
var GoogleStrategy = require('passport-google-oauth2').Strategy;

import {couchbaseClient} from '../db/couchbaseClient';

export class AuthRouter {
  router: Router

  constructor() {
    this.router = Router();
    this.init();
  }

  /**
   * Handles authentication & user registration.
   */
  public signin(req: Request, res: Response, next: NextFunction) {
    let idToken: string = req.body.idToken;
    passport.use(new GoogleStrategy({
      clientID: process.env['GOOGLE_CLIENT_ID'],
      clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
      callbackURL: "http://yourdormain:3000/auth/google/callback",
      passReqToCallback: true
    }, (request, accessToken, refreshToken, profile, done) => {
      // User was authenticated by Google, can now signin to/register for our app

      }
    ));
  }

  init() {
    this.router.get('/signin', this.signin);
  }

}

const authRouter = new AuthRouter();
export default authRouter.router;
