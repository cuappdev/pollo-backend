// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';
import lib from '../../../utils/Lib';

import type { APIUserSession } from '../APITypes';
import UsersRepo from '../../../repos/UsersRepo';
import UserSessionsRepo from '../../../repos/UserSessionsRepo';
import LogUtils from '../../../utils/LogUtils';

class RefreshTokenRouter extends AppDevRouter<APIUserSession> {
  constructor() {
    super(constants.REQUEST_TYPES.POST);
  }

  getPath(): string {
    return '/auth/fake/:platform/:id/';
  }

  middleware() {
    return [];
  }

  async content(req: Request) {
    const { platform, id } = req.params;
    if (process.env.NODE_ENV !== 'development' || (platform !== 'ios' && platform !== 'android')) {
      throw LogUtils.logErr('Cannot create fake session');
    }
    return UserSessionsRepo.createUserAndInitializeSession(platform, id, `${platform}${id}`);
  }
}

export default new RefreshTokenRouter().router;
