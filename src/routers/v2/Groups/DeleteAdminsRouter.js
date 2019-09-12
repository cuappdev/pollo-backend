// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';
import GroupsRepo from '../../../repos/GroupsRepo';
import LogUtils from '../../../utils/LogUtils';

import type { NoResponse } from '../../../utils/AppDevRouter';

class DeleteAdminsRouter extends AppDevRouter<NoResponse> {
  constructor() {
    super(constants.REQUEST_TYPES.PUT);
  }

  getPath(): string {
    return '/sessions/:id/admins/';
  }

  async content(req: Request) {
    const {
      user,
      params: { id: groupID },
      body: { adminIDs },
    } = req;

    if (!adminIDs) throw LogUtils.logErr('List of admin ids missing');
    if (!await GroupsRepo.isAdmin(groupID, user)) {
      throw LogUtils.logErr(
        'You are not authorized to remove admins from this group', {}, { groupID, user },
      );
    }

    await GroupsRepo.removeUserByGroupID(groupID, adminIDs, 'admin');
    return null;
  }
}

export default new DeleteAdminsRouter().router;
