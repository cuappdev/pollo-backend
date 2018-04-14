// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import DraftsRepo from '../../repos/DraftsRepo';
import constants from '../../utils/constants';

import type { APIDraft } from '../APITypes';

class PostDraftRouter extends AppDevRouter<Object> {
  constructor () {
    super(constants.REQUEST_TYPES.POST);
  }

  getPath (): string {
    return '/drafts/';
  }

  async content (req: Request): Promise<{ node: APIDraft }> {
    var text = req.body.text;
    var options = req.body.options;
    var user = req.user;

    if (!text) text = '';
    if (!options) options = [];

    const draft = await DraftsRepo.createDraft(text, options, user);

    return {
      node: {
        id: draft.id,
        text: draft.text,
        options: draft.options
      }
    };
  }
}

export default new PostDraftRouter().router;
