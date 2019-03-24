// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';
import DraftsRepo from '../../../repos/DraftsRepo';
import LogUtils from '../../../utils/LogUtils';

import type { NoResponse } from '../../../utils/AppDevRouter';

class DeleteDraftRouter extends AppDevRouter<NoResponse> {
  constructor() {
    super(constants.REQUEST_TYPES.DELETE);
  }

  getPath(): string {
    return '/drafts/:id/';
  }

  async content(req: Request) {
    const { id } = req.params;
    const admin = await DraftsRepo.getOwnerByID(id);
    if (!admin) throw LogUtils.logErr(`Can't get owner for draft by id: ${id}`);
    if (admin.id !== req.user.id) {
      throw LogUtils.logErr('Not authorized to delete draft', {},
        { admin: admin.id, id: req.user.id });
    }

    await DraftsRepo.deleteDraft(id);
    return null;
  }
}

export default new DeleteDraftRouter().router;
