// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/constants';
import type { APIUser } from '../APITypes';

class GetMeRouter extends AppDevRouter<APIUser> {
  constructor () {
    super(constants.REQUEST_TYPES.GET);
  }

  getPath (): string {
    return '/users/';
  }

  async content (req: Request) {
    return req.user && {
      id: req.user.id,
      name: req.user.firstName + ' ' + req.user.lastName,
      netId: req.user.netId
    };
  }
}

export default new GetMeRouter().router;
