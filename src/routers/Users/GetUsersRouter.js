// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import UsersRepo from '../../repos/UsersRepo';
import constants from '../../utils/constants';

class GetUsersRouter extends AppDevRouter {
  constructor () {
    super(constants.REQUEST_TYPES.GET);
  }

  getPath (): string {
    return '/users/';
  }

  async content (req: Request) {
    const rows = await UsersRepo.getUsers();
    return rows;
  }
}

export default new GetUsersRouter().router;
