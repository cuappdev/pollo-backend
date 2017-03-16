/**
 * Endpoints handling user authentication and update.
 */
import * as Promise from 'bluebird';
import {Router, Request, Response, NextFunction} from 'express';
import * as passport from 'passport';
import * as util from 'util';
var CustomStrategy = require('passport-custom');
var GoogleAuth = require('google-auth-library');

import {couchbaseClient} from '../db/couchbaseClient';
import * as constants from '../helpers/constants';
import {User, UserSchema} from '../db/schema';
import {UserHelper} from '../helpers/userHelper';

export class AuthRouter {
  router: Router;
  client: any;

  constructor() {
    this.router = Router();
    this.init();
    let auth = new GoogleAuth;
    this.client = new auth.OAuth2(process.env[constants.GOOGLE_CLIENT_ID], '', '');
    Promise.promisifyAll(this.client);
    // Add passport login strategy to express session.
    this.addSerializeUser();
    this.addDeserializeUser();
    this.addAuthStrategy();
  }

  /**
   * Authenticates an idToken against google api and creates a user.
   * @param idToken: string
   * @return Promise<UserSchema>
   */
  private validateAndGetUser(idToken: string): Promise<UserSchema> {
    let verifyPromise: Promise<any> = this.client.verifyIdTokenAsync(
      idToken, process.env[constants.GOOGLE_CLIENT_ID])
    return verifyPromise.then((login) => {
      var payload = login.getPayload();
      let email_extension_index = payload['email'].indexOf('@cornell.edu');
      if (email_extension_index <= -1)
        throw Error('Provided email was not a Cornell email address');

      return {
        email: payload['email'],
        displayName: payload['name'],
        name: { given_name: payload['given_name'], family_name: payload['family_name'] },
        netid: payload['email'].substring(0, email_extension_index),
        classes: []
      };
    });
  }

  /**
   * Determines if we already have an account for the provided user. If so
   * returns the existing user, else creates a new user with the provided information.
   * @param user: UserSchema. The user being validated.
   * @return Promise<UserSchema>
   */
  private findOrCreateUser(user: UserSchema): Promise<UserSchema> {
    return Promise.using(couchbaseClient.openAsyncBucket(constants.USERS_BUCKET), (bucket) => {
      return bucket.getAsync(util.format(constants.USERS_BUCKET_KEY, user.netid)).then((result: UserSchema) => {
        // User already exists in our system. Use that user.
        return result;
      }, (err) => {
        // User doesn't exist yet, insert them.
        return bucket.upsertAsync(util.format(constants.USERS_BUCKET_KEY, user.netid), user).then(() => {
          return user;
        })
      });
    });
  }

  /**
   * Creates a custom passport strategy for login.
   */
  public addAuthStrategy(): void {
    passport.use('custom-strategy', new CustomStrategy((req, done) => {
      this.validateAndGetUser(req.body.idToken)
        .then(this.findOrCreateUser)
        .then((user) => {
          return done(null, user);
        }, (err) => {
          // validation failed.
          return done(err);
        });
    }));
  }

  public addSerializeUser(): void {
    passport.serializeUser((user: UserSchema, done) => {
      Promise.using(couchbaseClient.openAsyncBucket(constants.USERS_BUCKET), (bucket) => {
        return UserHelper.serializeUser(bucket, user).then((serializedUser) => {
          return done(null, serializedUser);
        }, (err) => {
          return done(err);
        });
      })
    });
  }

  public addDeserializeUser(): void {
    passport.deserializeUser((user: User, done) => {
      Promise.using(couchbaseClient.openAsyncBucket(constants.USERS_BUCKET), (bucket) => {
        return UserHelper.deserializeUser(bucket, user).then((user) => {
          return done(null, user);
        }, (err) => {
          return done(err);
        });
      });
    });
  }

  /**
   * Handles authentication & user registration.
   */
  public googleAuth(req: Request, res: Response, next: NextFunction) {
    res.json(req.user);
  }

  init() {
    this.router.post('/signin', passport.authenticate('custom-strategy'), this.googleAuth);
  }
}

const authRouter: AuthRouter = new AuthRouter();
export default authRouter.router;
