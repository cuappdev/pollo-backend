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
      throw LogUtils.logErr(`Group with UUID ${groupID} was not found`);
    }

    if (!await GroupsRepo.isAdmin(groupID, user)) {
      throw LogUtils.logErr(
        'You are not authorized to update this group', {}, { groupID, user },
      );
    }

    group = await GroupsRepo.updateGroupByID(groupID, name);
    if (!group) {
      throw LogUtils.logErr(`Group with UUID ${groupID} was not found`);
    }

    return {
      ...group.serialize(),
      isLive: await req.app.groupManager.isLive(group.code),
    };
  }
}

export default new UpdateGroupRouter().router;
