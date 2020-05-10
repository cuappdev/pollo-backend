// @flow
import { Request } from 'express';
import DraftsRepo from '../../../repos/DraftsRepo';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';

import type { APIDraft } from '../APITypes';

class GetDraftsRouter extends AppDevRouter<APIDraft[]> {
  constructor() {
    super(constants.REQUEST_TYPES.GET);
  }

  getPath(): string {
    return '/drafts/';
  }

  async content(req: Request) {
    const drafts = await DraftsRepo.getDraftsByUser(req.user.uuid);

    return drafts
      .filter(Boolean)
      .map(draft => draft.serialize());
  }
}

export default new GetDraftsRouter().router;
