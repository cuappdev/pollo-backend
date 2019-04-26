// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import constants from '../../utils/Constants';
import GroupsRepo from '../../repos/GroupsRepo';
import LogUtils from '../../utils/LogUtils';
import lib from '../../utils/Lib';

import type { APIGroup } from './APITypes';

class JoinGroupRouter extends AppDevRouter<APIGroup> {
  constructor() {
    super(constants.REQUEST_TYPES.POST);
  }

  getPath(): string {
    return '/join/session/';
  }

  async content(req: Request) {
    const { code, location } = req.body;
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

    let group = await GroupsRepo.getGroupByID(id);
    if (!group) {
      throw LogUtils.logErr(`No group with id ${id} found`);
    }

    // add user as member if not in group in database
    const [isAdmin, isMember] = await Promise.all(
      [GroupsRepo.isAdmin(id, user), GroupsRepo.isMember(id, user)],
    );

    // if admin, update group's location if the location is non-null
    if (isAdmin) {
      const updatedGroup = await GroupsRepo.updateGroupByID(id, null, location);
      if (updatedGroup) group = updatedGroup;
    }

    // handle location restriction constraints for members
    if (isMember && group.isLocationRestricted) {
      if (!location || !location.lat || !location.long) {
        throw LogUtils.logErr('User with no location tried to join a location restricted group');
      }

      if (!group.location.lat || !group.location.long) {
        throw LogUtils.logErr('Location restricted group has a null location');
      } else {
        const withinRadius = lib.isWithin300m(location, group.location);
        if (!withinRadius) throw LogUtils.logErr('Out of range user tried to join group');
      }
    }

    if (req.app.groupManager.findSocket(code, id) === undefined) {
      await req.app.groupManager.startNewGroup(group);
    }

    if (!isAdmin && !isMember) {
      await GroupsRepo.addUsersByIDs(id, [user.id], 'member');
    }

    return {
      id: group.id,
      code: group.code,
      isFilterActivated: group.isFilterActivated,
      isLive: await req.app.groupManager.isLive(group.code),
      isLocationRestricted: group.isLocationRestricted,
      location: group.location,
      name: group.name,
      updatedAt: group.updatedAt,
    };
  }
}

export default new JoinGroupRouter().router;
