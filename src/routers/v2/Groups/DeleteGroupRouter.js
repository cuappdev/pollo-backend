// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';
import GroupsRepo from '../../../repos/GroupsRepo';
import LogUtils from '../../../utils/LogUtils';

import type { NoResponse } from '../../../utils/AppDevRouter';

class DeleteGroupRouter extends AppDevRouter<NoResponse> {
  constructor() {
    super(constants.REQUEST_TYPES.DELETE);
  }

  getPath(): string {
    return '/sessions/:id/';
  }

  async content(req: Request) {
    const groupID = req.params.id;
    const { user } = req;

    const group = await GroupsRepo.getGroupByID(groupID);
    if (!group) throw LogUtils.logErr(`Group with id ${groupID} not found`);

    if (!await GroupsRepo.isAdmin(groupID, user)) {
      throw LogUtils.logErr(
        'You are not authorized to delete this group', {}, { groupID, user },
      );
    }

    await GroupsRepo.deleteGroupByID(groupID);
    return null;
  }
}

export default new DeleteGroupRouter().router;
