// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';
import GroupsRepo from '../../../repos/GroupsRepo';
import LogUtils from '../../../utils/LogUtils';

import type { APIGroup } from '../APITypes';

class UpdateGroupRouter extends AppDevRouter<APIGroup> {
  constructor() {
    super(constants.REQUEST_TYPES.PUT);
  }

  getPath(): string {
    return '/sessions/:id/';
  }

  async content(req: Request) {
    const {
      user,
      params: { id: groupID },
      body: { name },
    } = req;

    if (!name) {
      throw LogUtils.logErr('No fields specified to update');
    }

    let group = await GroupsRepo.getGroupByID(groupID);
    if (!group) {
      throw LogUtils.logErr(`Group with id ${groupID} was not found`);
    }

    if (!await GroupsRepo.isAdmin(groupID, user)) {
      throw LogUtils.logErr(
        'You are not authorized to update this group', {}, { groupID, user },
      );
    }

    group = await GroupsRepo.updateGroupByID(groupID, name);
    if (!group) {
      throw LogUtils.logErr(`Group with id ${groupID} was not found`);
    }

    return {
      id: group.id,
      code: group.code,
      isLive: await req.app.groupManager.isLive(group.code),
      name: group.name,
      updatedAt: group.updatedAt,
    };
  }
}

export default new UpdateGroupRouter().router;
