// @flow
import { Request } from 'express';
import passport from 'passport';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';

import type { APIUserSession } from '../APITypes';

class SamlInitializeSessionRouter extends AppDevRouter<APIUserSession> {
  constructor() {
    super(constants.REQUEST_TYPES.POST);
  }

  getPath(): string {
    // Provider param selects SAML identity provider (ex: cornell).
    // Providers specified in utils/configurePassport.js
    return '/auth/saml/:provider/';
  }

  middleware() {
    return [passport.authenticate('saml', { session: false })];
  }

  async content(req: Request) {
    return req.user;
  }
}

export default new SamlInitializeSessionRouter().router;
