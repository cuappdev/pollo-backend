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

class AppDevResponse {
  success: boolean;
  data: Object;

  constructor (success: boolean, data: Object) {
    this.success = success;
    this.data = data;
  }
}

class AppDevRouter {
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
    }
  }

  response = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const content = await this.content(req);
      res.json(new AppDevResponse(true, content));
    } catch (e) {
      if (e.message === 1) {
        throw new Error('You must implement content()!');
      } else {
        res.json(new AppDevResponse(false, {errors: [e.message]}));
      }
    }
  }

  async content (req: Request): Promise<any> {
    throw new Error(1);
  }
}

export default AppDevRouter;
