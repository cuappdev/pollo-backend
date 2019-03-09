// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';
import DraftsRepo from '../../../repos/DraftsRepo';

import type { APIDraft } from '../APITypes';

class GetDraftsRouter extends AppDevRouter<APIDraft[]> {
  constructor() {
    super(constants.REQUEST_TYPES.GET);
  }

  getPath(): string {
    return '/drafts/';
  }

  async content(req: Request) {
    const drafts = await DraftsRepo.getDraftsByUser(req.user.id);

    return drafts
      .filter(Boolean)
      .map(draft => ({
        id: draft.id,
        text: draft.text,
        options: draft.options,
        createdAt: draft.createdAt.valueOf(),
      }));
  }
}

export default new GetDraftsRouter().router;
