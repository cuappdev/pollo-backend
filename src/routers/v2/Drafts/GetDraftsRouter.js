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
    const drafts = await DraftsRepo.getDraftsByUser(req.user.id);
    return drafts
      .filter(Boolean)
      .map(draft => ({
        id: draft.id,
        createdAt: draft.createdAt,
        text: draft.text,
        options: draft.options,
      }));
  }
}

export default new GetDraftsRouter().router;
