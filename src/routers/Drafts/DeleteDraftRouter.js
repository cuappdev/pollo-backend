// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import DraftsRepo from '../../repos/DraftsRepo';
import constants from '../../utils/constants';

import type { APIDraft } from '../APITypes';

class DeleteDraftRouter extends AppDevRouter<Object> {
  constructor () {
    super(constants.REQUEST_TYPES.DELETE);
  }

  getPath (): string {
    return '/drafts/:id/';
  }

  async content (req: Request) {
    var id = req.params.id;
    var user = req.user;

    await DraftsRepo.deleteDraft(id);
    return null;
  }
}

export default new DeleteDraftRouter().router;
