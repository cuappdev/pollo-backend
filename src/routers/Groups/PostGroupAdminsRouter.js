// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import GroupsRepo from '../../repos/GroupsRepo';
import constants from '../../utils/constants';

class PostGroupAdminsRouter extends AppDevRouter<Object> {
  constructor () {
    super(constants.REQUEST_TYPES.POST);
  }

  getPath (): string {
    return '/groups/:id/admins/';
  }

  async content (req: Request) {
    const id = req.params.id;
    const user = req.user;
    const adminIds = JSON.parse(req.body.adminIds);

    if (!adminIds) throw new Error('List of admin ids missing!');

    if (!await GroupsRepo.isAdmin(id, user)) {
      throw new Error('You are not authorized to add admins to this group!');
    }

    await GroupsRepo.addUsers(id, adminIds, 'admin');
    return null;
  }
}

export default new PostGroupAdminsRouter().router;
