// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';
import GroupsRepo from '../../../repos/GroupsRepo';
import LogUtils from '../../../utils/LogUtils';
import UsersRepo from '../../../repos/UsersRepo';

import type { APIGroup } from '../APITypes';

class GetGroupsRouter extends AppDevRouter<APIGroup[]> {
  constructor() {
    super(constants.REQUEST_TYPES.GET);
  }

  getPath(): string {
    return '/sessions/all/member/';
  }

  async content(req: Request) {
    const groups = await UsersRepo.getGroupsByID(req.user.id, 'member');
    if (!groups) throw LogUtils.logErr('Can\'t find member groups for user');
    const nodes = await groups
      .filter(Boolean)
      .map(async group => ({
        id: group.id,
        name: group.name,
        code: group.code,
        updatedAt: await GroupsRepo.latestActivityByGroupID(group.id),
        isLive: await req.app.groupManager.isLive(group.code),
        isLocationRestricted: group.isLocationRestricted,
        location: group.location,
      }));
    return Promise.all(nodes).then(n => n);
  }
}

export default new GetGroupsRouter().router;
