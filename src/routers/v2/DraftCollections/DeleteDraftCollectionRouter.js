// @flow

import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';
import DraftCollectionsRepo from '../../../repos/DraftCollectionsRepo';
import LogUtils from '../../../utils/LogUtils';
import GroupsRepo from '../../../repos/GroupsRepo';
import type { NoResponse } from '../../../utils/AppDevRouter';

class DeleteDraftCollectionRouter extends AppDevRouter<NoResponse> {
  constructor() {
    super(constants.REQUEST_TYPES.DELETE);
  }

  getPath(): string {
    return '/collections/:id/';
  }

  async content(req: Request) {
    const {
      user,
      params: { id },
    } = req;

    if (!user) throw LogUtils.logErr('User missing');

    let groupID;

    try {
      groupID = (await DraftCollectionsRepo.getGroupByID(id)).uuid;
    } catch (e) { throw LogUtils.logErr(`Error Getting owner of collection ${id}`); }

    if (!await GroupsRepo.isAdmin(groupID, user)) {
      throw LogUtils.logErr(
        'You are not authorized to update this group', {}, { groupID, user },
      );
    }

    await DraftCollectionsRepo.deleteDraftCollectionByID(id);
    return null;
  }
}

export default new DeleteDraftCollectionRouter().router;
