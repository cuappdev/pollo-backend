// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import constants from '../../utils/constants';
import GroupsRepo from '../../repos/GroupsRepo';

class DeleteGroupMembersRouter extends AppDevRouter<Object> {
  constructor () {
    super(constants.REQUEST_TYPES.PUT);
  }

  getPath (): string {
    return '/groups/:id/members/';
  }

  async content (req: Request) {
    const groupId = req.params.id;
    const user = req.user;
    const memberIds = req.body.memberIds;

    if (!memberIds) throw new Error('List of member ids missing!');

    if (!await GroupsRepo.isAdmin(groupId, user)) {
      throw new Error('You are not authorized to remove members from this group!');
    }

    await GroupsRepo.removeUsers(groupId, memberIds, 'member');
    return null;
  }
}

export default new DeleteGroupMembersRouter().router;
