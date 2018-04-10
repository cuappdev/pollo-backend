// @flow
import { Request } from 'express';
import DraftsRepo from '../../repos/DraftsRepo';
import AppDevRouter from '../../utils/AppDevRouter';
import constants from '../../utils/constants';

import type { APIDraft } from '../APITypes';

class UpdateDraftRouter extends AppDevRouter<Object> {
  constructor () {
    super(constants.REQUEST_TYPES.PUT);
  }

  getPath (): string {
    return '/drafts/:id/';
  }

  async content (req: Request): Promise<{ node: APIDraft }> {
    const draftId = req.params.id;
    var text = req.body.text;
    var options = req.body.options;
    var user = req.user;

    if (!options && !text) {
      throw new Error('No fields specified to update.');
    }

    const draft = await DraftsRepo.updateDraft(draftId, text, options);
    if (!draft) {
      throw new Error(`Draft with id ${draftId} was not found!`);
    }

    return {
      node: {
        id: draft.id,
        text: draft.text,
        options: draft.options
      }
    };
  }
}

export default new UpdateDraftRouter().router;
