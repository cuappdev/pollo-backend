// @flow
import { Request } from 'express';
import DraftsRepo from '../../../repos/DraftsRepo';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';
import LogUtils from '../../../utils/LogUtils';

import type { APIDraft } from '../APITypes';

class UpdateDraftRouter extends AppDevRouter<APIDraft> {
  constructor() {
    super(constants.REQUEST_TYPES.PUT);
  }

  getPath(): string {
    return '/drafts/:id/';
  }

  async content(req: Request) {
    const draftID = req.params.id;
    const { text, options } = req.body;
    const admin = await DraftsRepo.getOwnerByID(draftID);
    if (!admin) throw LogUtils.logErr(`Draft with id ${draftID} was not found`);

    if (!options && !text) {
      throw LogUtils.logErr('No fields specified to update', {}, { options, text });
    }

    if (admin.id !== req.user.id) {
      throw LogUtils.logErr(
        'Not authorized to update draft',
        {},
        { admin: admin.id, id: req.user.id },
      );
    }

    const draft = await DraftsRepo.updateDraft(draftID, text, options);
    if (!draft) {
      throw LogUtils.logErr(`Draft with id ${draftID} was not found`);
    }

    return {
      id: draft.id,
      createdAt: draft.createdAt,
      text: draft.text,
      options: draft.options,
    };
  }
}

export default new UpdateDraftRouter().router;
