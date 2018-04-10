// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import constants from '../../utils/constants';
import GroupsRepo from '../../repos/GroupsRepo';

class DeleteGroupAdminsRouter extends AppDevRouter<Object> {
  constructor () {
    super(constants.REQUEST_TYPES.PUT);
  }

  getPath (): string {
    return '/groups/:id/admins/';
  }

  async content (req: Request) {
    const groupId = req.params.id;
    const user = req.user;
    const adminIds = req.body.adminIds;

    if (!adminIds) throw new Error('List of admin ids missing!');

    if (!await GroupsRepo.isAdmin(groupId, user)) {
      throw new Error('You are not authorized to remove admins from this group!');
    }

    await GroupsRepo.removeUsers(groupId, adminIds, 'admin');
    return null;
  }
}

export default new DeleteGroupAdminsRouter().router;
