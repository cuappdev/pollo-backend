// @flow
import { Request } from 'express';
import GroupsRepo from '../../repos/GroupsRepo';
import AppDevRouter from '../../utils/AppDevRouter';
import constants from '../../utils/Constants';
import LogUtils from '../../utils/LogUtils';

import type { APIGroup } from './APITypes';

class JoinGroupRouter extends AppDevRouter<APIGroup> {
  constructor() {
    super(constants.REQUEST_TYPES.POST);
  }

  getPath(): string {
    return '/join/session/';
  }

  async content(req: Request) {
    const { code } = req.body;
    let { id } = req.body;
    const { user } = req;

    if (!user.id) throw LogUtils.logErr('User id missing');

    if (!id && !code) {
      throw LogUtils.logErr('Group id or code required');
    }

    if (code) {
      id = await GroupsRepo.getGroupID(code);
      if (!id) {
        throw LogUtils.logErr(`No group with code ${code} found`);
      }
    }

    const group = await GroupsRepo.getGroupByID(id);
    if (!group) {
      throw LogUtils.logErr(`No group with UUID ${id} found`);
    }

    // add user as member if not in group in database
    const [isAdmin, isMember] = await Promise.all(
      [GroupsRepo.isAdmin(id, user), GroupsRepo.isMember(id, user)],
    );

    if (req.app.groupManager.findSocket(code, id) === undefined) {
      await req.app.groupManager.startNewGroup(group);
    }

    if (!isAdmin && !isMember) {
      await GroupsRepo.addUsersByIDs(id, [user.uuid], 'member');
    }

    return {
      ...group.serialize(),
      isLive: await req.app.groupManager.isLive(group.code),
    };
  }
}

export default new JoinGroupRouter().router;
