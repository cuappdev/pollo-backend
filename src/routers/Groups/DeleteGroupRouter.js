// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import constants from '../../utils/constants';
import GroupsRepo from '../../repos/GroupsRepo';

class DeleteGroupRouter extends AppDevRouter<Object> {
  constructor () {
    super(constants.REQUEST_TYPES.DELETE);
  }

  getPath (): string {
    return '/groups/:id/';
  }

  async content (req: Request) {
    const groupId = req.params.id;
    const user = req.user;

    const group = await GroupsRepo.getGroupById(groupId);
    if (!group) throw new Error(`Group with id ${groupId} not found!`);

    if (!await GroupsRepo.isAdmin(groupId, user)) {
      throw new Error('You are not authorized to delete this group!');
    }

    await GroupsRepo.deleteGroupById(groupId);
    return null;
  }
}

export default new DeleteGroupRouter().router;
