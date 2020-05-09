// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';
import LogUtils from '../../../utils/LogUtils';
import GroupsRepo from '../../../repos/GroupsRepo';
import DraftCollectionsRepo from '../../../repos/DraftCollectionsRepo';
import Group from '../../../models/Group';
import type { APIDraftCollection } from '../APITypes';
import Draft from '../../../models/Draft';

class UpdateDraftCollectionRouter extends AppDevRouter<APIDraftCollection> {
  constructor() {
    super(constants.REQUEST_TYPES.PUT);
  }

  getPath(): string {
    return '/collections/:id/';
  }

  async content(req: Request) {
    const {
      user,
      params: { id },
      body: { name, draftID, pos },
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

    let draftCollection;

    if (name) await DraftCollectionsRepo.updateCollectionNameByID(id, name);
    if (draftID && (pos || pos === 0)) {
      await DraftCollectionsRepo.moveDraftByID(id, draftID, pos);
    } else if (draftID) {
      throw LogUtils
        .logErr('When updating a draft, position cannot be left out', {}, { groupID, user });
    }

    draftCollection = await DraftCollectionsRepo.getDraftCollection(id);

    return draftCollection.serialize();
  }
}

export default new UpdateDraftCollectionRouter().router;
