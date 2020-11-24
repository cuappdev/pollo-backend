// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';
import lib from '../../../utils/Lib';

import type { APIUserSession } from '../APITypes';

class RefreshTokenRouter extends AppDevRouter<APIUserSession> {
  constructor() {
    super(constants.REQUEST_TYPES.POST);
  }

  getPath(): string {
    return '/auth/refresh/';
  }

  middleware() {
    return [lib.updateSession];
  }

  async content(req: Request) {
    return req.userSession;
  }
}

export default new RefreshTokenRouter().router;
