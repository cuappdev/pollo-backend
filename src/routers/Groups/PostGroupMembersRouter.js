// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import GroupsRepo from '../../repos/GroupsRepo';
import constants from '../../utils/constants';

class PostGroupMembersRouter extends AppDevRouter<Object> {
  constructor () {
    super(constants.REQUEST_TYPES.POST);
  }

  getPath (): string {
    return '/groups/:id/members/';
  }

  async content (req: Request) {
    const id = req.params.id;
    const user = req.user;
    const memberIds = req.body.memberIds;

    if (!memberIds) throw new Error('List of member ids missing!');

    if (!await GroupsRepo.isAdmin(id, user)) {
      throw new Error('You are not authorized to add members to this group!');
    }

    await GroupsRepo.addUsers(id, memberIds, 'member');
    return null;
  }
}

export default new PostGroupMembersRouter().router;
