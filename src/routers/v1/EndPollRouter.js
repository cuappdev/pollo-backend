// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import constants from '../../utils/constants';
import SessionsRepo from '../../repos/SessionsRepo';

class EndPollRouter extends AppDevRouter<Object> {
  constructor() {
    super(constants.REQUEST_TYPES.POST, false);
  }

  getPath(): string {
    return '/polls/:id/end/';
  }

  async content(req: Request) {
    const { id } = req.params;
    const { save } = req.body;

    const poll = await SessionsRepo.getSessionById(id);
    if (!poll) {
      throw new Error(`No poll with id ${id} found.`);
    }

    if (save === 'false' || save === '0') {
      await SessionsRepo.deleteSessionById(id);
    }

    req.app.sessionManager.endSession(poll, save);

    return null;
  }
}

export default new EndPollRouter().router;
