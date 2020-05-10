// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';
import GroupsRepo from '../../../repos/GroupsRepo';
import LogUtils from '../../../utils/LogUtils';

import type { APIGroup } from '../APITypes';

class GetGroupRouter extends AppDevRouter<APIGroup> {
  constructor() {
    super(constants.REQUEST_TYPES.GET);
  }

  getPath(): string {
    return '/sessions/:id/';
  }

  async content(req: Request) {
    const { id } = req.params;
    const group = await GroupsRepo.getGroupByID(id);
    if (!group) throw LogUtils.logErr(`Group with UUID ${id} not found!`);
    
    return {
      ...group.serialize(),
      isLive: await req.app.groupManager.isLive(group.code),
      updatedAt: await GroupsRepo.latestActivityByGroupID(group.uuid),
    };
  }
}

export default new GetGroupRouter().router;
