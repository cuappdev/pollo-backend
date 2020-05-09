// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';
import LogUtils from '../../../utils/LogUtils';
import GroupsRepo from '../../../repos/GroupsRepo';
import DraftCollectionsRepo from '../../../repos/DraftCollectionsRepo';
import Group from '../../../models/Group';
import Draft from '../../../models/Draft';
import type { NoResponse } from '../../../utils/AppDevRouter';

class DeleteDraftFromCollectionRouter extends AppDevRouter<NoResponse> {
  constructor() {
    super(constants.REQUEST_TYPES.PUT);
  }

  getPath(): string {
    return '/collections/:id/drafts/';
  }

  async content(req: Request) {
    const {
      user,
      params: { id },
      body: { draftID },
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

    if (!draftID) throw LogUtils.logErr('Draft Missing');

    await DraftCollectionsRepo.removeDraftById(id, draftID);

    return null;
  }
}

export default new DeleteDraftFromCollectionRouter().router;
