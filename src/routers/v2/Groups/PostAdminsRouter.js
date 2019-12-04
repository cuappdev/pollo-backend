// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';
import GroupsRepo from '../../../repos/GroupsRepo';
import LogUtils from '../../../utils/LogUtils';

import type { NoResponse } from '../../../utils/AppDevRouter';

class PostAdminsRouter extends AppDevRouter<NoResponse> {
  constructor() {
    super(constants.REQUEST_TYPES.POST);
  }

  getPath(): string {
    return '/sessions/:id/admins/';
  }

  async content(req: Request) {
    const {
      user,
      params: { id },
      body: { adminIDs },
    } = req;

    if (!adminIDs) throw LogUtils.logErr('List of admin ids missing');
    if (!await GroupsRepo.isAdmin(id, user)) {
      throw LogUtils.logErr(
        'You are not authorized to add admins to this group', {}, { id, user },
      );
    }

    await GroupsRepo.addUsersByIDs(id, adminIDs, 'admin');
    return null;
  }
}

export default new PostAdminsRouter().router;
