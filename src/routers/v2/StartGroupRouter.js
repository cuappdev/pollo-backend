// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import constants from '../../utils/Constants';
import GroupsRepo from '../../repos/GroupsRepo';
import LogUtils from '../../utils/LogUtils';

import type { APIGroup } from './APITypes';

class StartGroupRouter extends AppDevRouter<APIGroup> {
  constructor() {
    super(constants.REQUEST_TYPES.POST);
  }

  getPath(): string {
    return '/start/session/';
  }

  async content(req: Request) {
    const { code, location } = req.body;
    let { name } = req.body;

    if (!name) name = '';

    if (!code) {
      throw LogUtils.logErr('Code required');
    }

    const group = await GroupsRepo.createGroup(name, code, req.user, location);
    await req.app.groupManager.startNewGroup(group);

    return {
      ...group.serialize(),
      isLive: true,
      updatedAt: await GroupsRepo.latestActivityByGroupID(group.uuid),
    };
  }
}

export default new StartGroupRouter().router;
