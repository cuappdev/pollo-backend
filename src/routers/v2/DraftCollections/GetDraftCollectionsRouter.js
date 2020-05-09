// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';
import type { APIDraftCollection } from '../APITypes';
import LogUtils from '../../../utils/LogUtils';
import GroupsRepo from '../../../repos/GroupsRepo';
import DraftCollectionsRepo from '../../../repos/DraftCollectionsRepo';
import DraftCollection from '../../../models/DraftCollection';

class GetDraftCollectionsRouter extends AppDevRouter<APIDraftCollection> {
  constructor() {
    super(constants.REQUEST_TYPES.GET);
  }

  getPath(): string {
    return '/sessions/:id/collections/';
  }

  async content(req: Request) {
    const {
      user,
      params: { id },
    } = req;

    if (!user) throw LogUtils.logErr('User missing');

    if (!await GroupsRepo.isAdmin(id, user)) {
      throw LogUtils.logErr(
        'You are not authorized to update this group', {}, { id, user },
      );
    }

    const collections = (await DraftCollectionsRepo.getDraftCollectionsByGroup(id))
      .filter(Boolean)
      .map((dc: DraftCollection) => dc.serialize());

    return collections;
  }
}

export default new GetDraftCollectionsRouter().router;
