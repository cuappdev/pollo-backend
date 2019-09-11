// @flow
import { Request } from 'express';
import DraftsRepo from '../../../repos/DraftsRepo';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';

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
    return {
      id: draft.id,
      createdAt: draft.createdAt,
      text: draft.text,
      options: draft.options,
    };
  }
}

export default new PostDraftRouter().router;
