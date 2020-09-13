// @flow
import { Request } from 'express';
import passport from 'passport';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';


import type { APIUserSession } from '../APITypes';

class InitializeSessionRouter extends AppDevRouter<APIUserSession> {
  constructor() {
    super(constants.REQUEST_TYPES.POST);
  }

  getPath(): string {
    return '/auth/saml/';
  }

  middleware() {
    return [passport.authenticate('saml', { session: false })];
  }

  async content(req: Request) {
    return req.user;
  }
}

export default new InitializeSessionRouter().router;
