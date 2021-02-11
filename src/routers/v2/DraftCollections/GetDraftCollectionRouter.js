// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';
import type { APIDraftCollection } from '../APITypes';
import LogUtils from '../../../utils/LogUtils';
import GroupsRepo from '../../../repos/GroupsRepo';
import DraftCollectionsRepo from '../../../repos/DraftCollectionsRepo';

class GetDraftCollectionRouter extends AppDevRouter<APIDraftCollection> {
  constructor() {
    super(constants.REQUEST_TYPES.GET);
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

    return (await DraftCollectionsRepo.getDraftCollection(id)).serialize();
  }
}

export default new GetDraftCollectionRouter().router;
