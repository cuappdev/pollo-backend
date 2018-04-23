// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/constants';
import SessionsRepo from '../../../repos/SessionsRepo';

class DeleteMembersRouter extends AppDevRouter<Object> {
  constructor () {
    super(constants.REQUEST_TYPES.PUT);
  }

  getPath (): string {
    return '/sessions/:id/members/';
  }

  async content (req: Request) {
    const groupId = req.params.id;
    const user = req.user;
    const memberIds = JSON.parse(req.body.memberIds);

    if (!memberIds) throw new Error('List of member ids missing!');

    if (!await SessionsRepo.isAdmin(groupId, user)) {
      throw new Error('You are not authorized to remove members from this group!');
    }

    await SessionsRepo.removeUserBySessionId(groupId, memberIds, 'member');
    return null;
  }
}

export default new DeleteMembersRouter().router;
