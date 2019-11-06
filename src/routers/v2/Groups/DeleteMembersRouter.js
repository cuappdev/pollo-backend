// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';
import GroupsRepo from '../../../repos/GroupsRepo';
import LogUtils from '../../../utils/LogUtils';

import type { NoResponse } from '../../../utils/AppDevRouter';

class DeleteMembersRouter extends AppDevRouter<NoResponse> {
  constructor() {
    super(constants.REQUEST_TYPES.PUT);
  }

  getPath(): string {
    return '/sessions/:id/members/';
  }

  async content(req: Request) {
    const {
      user,
      params: { id: groupID },
      body: { memberIDs },
    } = req;

    if (!memberIDs) throw LogUtils.logErr('List of member UUIDs missing');

    if (!await GroupsRepo.isAdmin(groupID, user)) {
      throw LogUtils.logErr(
        'You are not authorized to remove members from this group', {}, { groupID, user },
      );
    }

    await GroupsRepo.removeUserByGroupID(groupID, memberIDs, 'member');
    return null;
  }
}

export default new DeleteMembersRouter().router;
