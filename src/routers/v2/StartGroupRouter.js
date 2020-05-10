// @flow
import { Request } from 'express';
import GroupsRepo from '../../repos/GroupsRepo';
import AppDevRouter from '../../utils/AppDevRouter';
import constants from '../../utils/Constants';

import type { APIGroup } from './APITypes';

class StartGroupRouter extends AppDevRouter<APIGroup> {
  constructor() {
    super(constants.REQUEST_TYPES.POST);
  }

  getPath(): string {
    return '/start/session/';
  }

  async content(req: Request) {
    const code = GroupsRepo.createCode();
    let { name } = req.body;

    if (!name) name = '';

    const group = await GroupsRepo.createGroup(name, code, req.user);
    await req.app.groupManager.startNewGroup(group);
    return {
      ...group.serialize(),
      isLive: true,
      updatedAt: await GroupsRepo.latestActivityByGroupID(group.uuid),
    };
  }
}

export default new StartGroupRouter().router;
