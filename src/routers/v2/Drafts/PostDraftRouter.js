// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';
import DraftsRepo from '../../../repos/DraftsRepo';

import type { APIDraft } from '../APITypes';

class PostDraftRouter extends AppDevRouter<APIDraft> {
  constructor() {
    super(constants.REQUEST_TYPES.POST);
  }

  getPath(): string {
    return '/drafts/';
  }

  async content(req: Request) {
    let { text, options } = req.body;
    const { user } = req;

    if (!text) text = '';
    if (!options) options = [];

    const draft = await DraftsRepo.createDraft(text, options, user);

    return draft.serialize();
  }
}

export default new PostDraftRouter().router;
