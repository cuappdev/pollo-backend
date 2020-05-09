// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';
import LogUtils from '../../../utils/LogUtils';
import GroupsRepo from '../../../repos/GroupsRepo';
import DraftCollectionsRepo from '../../../repos/DraftCollectionsRepo';
import Group from '../../../models/Group';
import type { APIDraft, APIDraftCollection } from '../APITypes';
import Draft from '../../../models/Draft';

class GetDraftsFromCollectionRouter extends AppDevRouter<APIDraft[]> {
  constructor() {
    super(constants.REQUEST_TYPES.GET);
  }

  getPath(): string {
    return '/collections/:id/drafts/';
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

    let draftCollection = (await DraftCollectionsRepo.getDraftCollection(id)).drafts
      .filter(Boolean)
      .map((d: Draft) => d.serialize());

    return draftCollection;
  }
}

export default new GetDraftsFromCollectionRouter().router;
