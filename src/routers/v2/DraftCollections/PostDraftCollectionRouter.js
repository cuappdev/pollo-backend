// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';
import LogUtils from '../../../utils/LogUtils';
import GroupsRepo from '../../../repos/GroupsRepo';
import DraftCollectionsRepo from '../../../repos/DraftCollectionsRepo';
import type { APIDraftCollection } from '../APITypes';

class PostDraftCollectionRouter extends AppDevRouter<APIDraftCollection> {
  constructor() {
    super(constants.REQUEST_TYPES.POST);
  }

  getPath(): string {
    return '/sessions/:id/collections/';
  }

  async content(req: Request) {
    let { name } = req.body;
    const {
      user,
      params: { id },
    } = req;

    if (!name) name = '';
    if (!user) throw LogUtils.logErr('User missing');

    if (!await GroupsRepo.isAdmin(id, user)) {
      throw LogUtils.logErr(
        'You are not authorized to update this group', {}, { id, user },
      );
    }

    let draftCollection = await DraftCollectionsRepo.createDraftCollection(name, id);

    return draftCollection.serialize();
  }
}

export default new PostDraftCollectionRouter().router;
