// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';
import lib from '../../../utils/Lib';

import type { APIUserSession } from '../APITypes';
import UsersRepo from '../../../repos/UsersRepo';
import UserSessionsRepo from '../../../repos/UserSessionsRepo';

class RefreshTokenRouter extends AppDevRouter<APIUserSession> {
  constructor() {
    super(constants.REQUEST_TYPES.POST);
  }

  getPath(): string {
    return '/auth/fake/';
  }

  middleware() {
    return [];
  }

  async content(req: Request) {
    return UserSessionsRepo.createUserAndInitializeSession();
  }
}

export default new RefreshTokenRouter().router;
