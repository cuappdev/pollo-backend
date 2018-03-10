// @flow
import AppDevNodeRouter from '../../utils/AppDevNodeRouter';
import UsersRepo from '../../repos/UsersRepo';

import type { APIUser } from '../APITypes';

class GetUser extends AppDevNodeRouter<APIUser> {
  getPath (): string {
    return '/users/:id/';
  }

  async fetchWithId (id: number) {
    const user = await UsersRepo.getUserById(id);
    if (!user) throw new Error(`Can not find user with id ${id}!`);
    return user && {
      id: user.id,
      name: user.firstName + ' ' + user.lastName,
      netId: user.netId
    };
  }
}

export default new GetUser().router;
