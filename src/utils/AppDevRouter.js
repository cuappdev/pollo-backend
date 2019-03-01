// @flow
// A REST-API Router parent that handles boilerplate for
// serving up JSON responses based on HTTP verb

import {
    NextFunction,
    Request,
    Response,
    Router,
} from 'express';

import AppDevResponse from './AppDevResponse';
import AppDevUtils from './AppDevUtils';
import constants from './Constants';
import lib from './Lib';
import LogUtils from './LogUtils';

import type { RequestType } from './Constants';

/**
 * ExpressHandlerFunction - the function signature of callbacks for Express
 * Router objects
 */
export type ExpressCallback = (Request, Response, NextFunction) => any;

/**
 * T is the response type for AppDevRouter
 */
export default class AppDevRouter<T: Object> {
  router: Router;

  requestType: RequestType;

  getPath(): string {
      throw LogUtils.logErr('You must implement getPath() with a valid path');
  }

  constructor(type: RequestType) {
      this.router = new Router();
      this.requestType = type;

      // Initialize this router
      this.init();
  }

  init() {
      const path = this.getPath();
      const middleware = this.middleware();

      // Make sure path conforms to specifications
      AppDevUtils.tryCheckAppDevURL(path);

      // Attach content to router
      switch (this.requestType) {
          case constants.REQUEST_TYPES.GET:
              this.router.get(path, middleware, this.response);
              break;
          case constants.REQUEST_TYPES.POST:
              this.router.post(path, middleware, this.response);
              break;
          case constants.REQUEST_TYPES.DELETE:
              this.router.delete(path, middleware, this.response);
              break;
          case constants.REQUEST_TYPES.PUT:
              this.router.put(path, middleware, this.response);
              break;
          default:
              break;
      }
  }
  
  /**
   * Subclasses must override this to supply middleware for the API.
   */
  middleware(): ExpressCallback[] {
      // By default makes route secured
      return [lib.ensureAuthenticated];
  }

  response = async (req: Request, res: Response, next: NextFunction) => {
      try {
          const content: T = await this.content(req);
          res.json(new AppDevResponse(true, content));
      } catch (e) {
          if (e.message === 1) {
              throw LogUtils.logErr('You must implement content()');
          } else {
              res.json(new AppDevResponse(false, { errors: [e.message] }));
          }
      }
  }

  async content(req: Request): Promise<any> {
      throw new Error(1);
  }
}
