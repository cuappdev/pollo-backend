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
 * NoResponse - specifies the empty response for requests such as deleting a resource
 */
export type NoResponse = null;

/**
 * ResponseType - specifies that the content a route can return either an object,
 * a list of objects, or no response
 */
export type ResponseType = NoResponse | Object | any[];

/**
 * T is the response type for AppDevRouter
 */
export default class AppDevRouter<T: ResponseType> {
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
    const res = this.response();

    // Make sure path conforms to specifications
    AppDevUtils.tryCheckAppDevURL(path);

    // Attach middleware to router
    middleware.forEach((mw) => {
      this.router.use(path, mw);
    });

    // Attach content to router
    switch (this.requestType) {
      case constants.REQUEST_TYPES.GET:
        this.router.get(path, res);
        break;
      case constants.REQUEST_TYPES.POST:
        this.router.post(path, res);
        break;
      case constants.REQUEST_TYPES.DELETE:
        this.router.delete(path, res);
        break;
      case constants.REQUEST_TYPES.PUT:
        this.router.put(path, res);
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

  defaultResponse = async (req: Request, res: Response, next: NextFunction) => {
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

  response(): (req: Request, res: Response, next: NextFunction) => Promise<void> {
    return this.defaultResponse;
  }

  async content(req: Request): Promise<T> {
    throw new Error(1);
  }
}
