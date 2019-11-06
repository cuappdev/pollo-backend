// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';

import type { APIUser } from '../APITypes';

class GetMeRouter extends AppDevRouter<APIUser> {
  constructor() {
    super(constants.REQUEST_TYPES.GET);
  }

  getPath(): string {
    return '/users/';
  }

  async content(req: Request) {
    return req.user.serialize();
  }
}

export default new GetMeRouter().router;
