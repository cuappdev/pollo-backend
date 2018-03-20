// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import GroupsRepo from '../../repos/GroupsRepo';
import constants from '../../utils/constants';

import type { APIGroup } from '../APITypes';

class UpdateGroupRouter extends AppDevRouter<APIGroup> {
  constructor () {
    super(constants.REQUEST_TYPES.PUT);
  }

  getPath (): string {
    return '/groups/:id/';
  }

  async content (req: Request): Promise<{ node: APIGroup }> {
    const name = req.body.name;
    const groupId = req.params.id;
    const user = req.user;

    if (!name) throw new Error('No fields specified to update.');

    var group = await GroupsRepo.getGroupById(groupId);
    if (!group) throw new Error(`Group with id ${groupId} was not found!`);

    if (!await GroupsRepo.isAdmin(groupId, user)) {
      throw new Error('You are not authorized to update this group!');
    }

    group = await GroupsRepo.updateGroupById(group.id, name);
    if (!group) throw new Error(`Group with id ${groupId} was not found!`);
    return {
      node: {
        id: group.id,
        name: group.name,
        code: group.code
      }
    };
  }
}

export default new UpdateGroupRouter().router;
