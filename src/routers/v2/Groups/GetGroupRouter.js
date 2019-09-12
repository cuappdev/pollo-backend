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
    const group = await GroupsRepo.getGroupByID(req.params.id);
    if (!group) throw LogUtils.logErr(`Group with id ${req.params.id} not found!`);
    return {
      id: group.id,
      code: group.code,
      isFilterActivated: group.isFilterActivated,
      isLive: await req.app.groupManager.isLive(group.code),
      isLocationRestricted: group.isLocationRestricted,
      location: group.location,
      name: group.name,
      updatedAt: await GroupsRepo.latestActivityByGroupID(group.id),
    };
  }
}

export default new GetGroupRouter().router;
