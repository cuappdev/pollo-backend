// @flow
// A REST-API Router parent that handles boilerplate for
// serving up JSON responses based on HTTP verb

import type {RequestType} from './constants';

import {
  Router,
  Request,
  Response,
  NextFunction
} from 'express';

import constants from './constants';
import SessionsRepo from '../repos/SessionsRepo';

// Checks authentication header for token
async function ensureAuthenticated (req, res, next) {
  const header = req.get('Authorization');
  if (!header) {
    res.send(new AppDevResponse(false,
      {errors: ['Authorization header missing!']}));
    return next(true);
  }
  const bearerToken = header.replace('Bearer ', '').trim();
  if (!bearerToken) {
    res.send(new AppDevResponse(false,
      {errors: ['Invalid authorization header!']}));
    return next(true);
  }

  if (!await SessionsRepo.verifySession(bearerToken)) {
    res.send(new AppDevResponse(false,
      {errors: ['Invalid session token']}));
    return next(true);
  }
  const user = await SessionsRepo.getUserFromToken(bearerToken);
  req.user = user;

  return next();
}

class AppDevResponse<T> {
  success: boolean;
  data: T;

  constructor (success: boolean, data: T) {
    this.success = success;
    this.data = data;
  }
}

/**
 * T is the response type for AppDevRouter
 */
export default class AppDevRouter<T: Object> {
  router: Router;
  requestType: RequestType;

  getPath (): string {
    throw new Error('You must implement getPath() with a valid path!');
  }

  constructor (type: RequestType) {
    this.router = new Router();
    this.requestType = type;

    // Initialize this router
    this.init();
  }

  init () {
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
    switch (this.requestType) {
    case constants.REQUEST_TYPES.GET:
      this.router.get(path, ensureAuthenticated, this.response);
      break;
    case constants.REQUEST_TYPES.POST:
      this.router.post(path, ensureAuthenticated, this.response);
      break;
    case constants.REQUEST_TYPES.DELETE:
      this.router.delete(path, ensureAuthenticated, this.response);
      break;
    case constants.REQUEST_TYPES.PUT:
      this.router.put(path, ensureAuthenticated, this.response);
      break;
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
        res.json(new AppDevResponse(false, {errors: [e.message]}));
      }
    }
  }

  async content (req: Request): Promise<any> {
    throw new Error(1);
  }
}
