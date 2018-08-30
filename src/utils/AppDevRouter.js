// @flow
// A REST-API Router parent that handles boilerplate for
// serving up JSON responses based on HTTP verb

import {
  Router,
  Request,
  Response,
  NextFunction
} from 'express';
import type { RequestType } from './constants';
import AppDevResponse from './AppDevResponse';


import constants from './constants';
import lib from './lib';

/**
 * T is the response type for AppDevRouter
 */
export default class AppDevRouter<T: Object> {
  router: Router;

  requestType: RequestType;

  authenticated: boolean;

  getPath(): string {
    throw new Error('You must implement getPath() with a valid path!');
  }

  constructor(type: RequestType, auth: ?boolean) {
    this.router = new Router();
    this.requestType = type;
    if (auth !== undefined && auth !== null) {
      this.authenticated = auth;
    } else {
      this.authenticated = true;
    }

    // Initialize this router
    this.init();
  }

  init() {
    const path = this.getPath();

    // Error handle path
    if (path.length < 2) {
      throw new Error('Invalid path!');
    } else if (path[0] !== '/') {
      throw new Error('Path must start with a \'/\'!');
    } else if (path[path.length - 1] !== '/') {
      throw new Error('Path must end with a \'/\'!');
    }
    // Attach content to router
    if (this.authenticated) {
      switch (this.requestType) {
      case constants.REQUEST_TYPES.GET:
        this.router.get(path, lib.ensureAuthenticated, this.response);
        break;
      case constants.REQUEST_TYPES.POST:
        this.router.post(path, lib.ensureAuthenticated, this.response);
        break;
      case constants.REQUEST_TYPES.DELETE:
        this.router.delete(path, lib.ensureAuthenticated, this.response);
        break;
      case constants.REQUEST_TYPES.PUT:
        this.router.put(path, lib.ensureAuthenticated, this.response);
        break;
      default:
        break;
      }
    } else {
      switch (this.requestType) {
      case constants.REQUEST_TYPES.GET:
        this.router.get(path, this.response);
        break;
      case constants.REQUEST_TYPES.POST:
        this.router.post(path, this.response);
        break;
      case constants.REQUEST_TYPES.DELETE:
        this.router.delete(path, this.response);
        break;
      case constants.REQUEST_TYPES.PUT:
        this.router.put(path, this.response);
        break;
      default:
        break;
      }
    }
  }

  response = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const content: T = await this.content(req);
      res.json(new AppDevResponse(true, content));
    } catch (e) {
      if (e.message === 1) {
        throw new Error('You must implement content()!');
      } else {
        console.error(e);
        res.json(new AppDevResponse(false, { errors: [e.message] }));
      }
    }
  }

  async content(req: Request): Promise<any> {
    throw new Error(1);
  }
}
