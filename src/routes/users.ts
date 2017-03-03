/**
 * Endpoints handling user authentication and update.
 */
import * as Promise from 'bluebird';
import {Router, Request, Response, NextFunction} from 'express';

import {couchbaseClient} from '../db/couchbaseClient';

export class UserRouter {
  router: Router

  constructor() {
    this.router = Router();
    this.init();
  }

  /**
   * Handles authentication & user registration.
   */
  public signin(req: Request, res: Response, next: NextFunction) {
    
  }

  init() {
    this.router.get('/signin', this.signin);
  }

}

const userRouter = new UserRouter();
export default userRouter.router;
