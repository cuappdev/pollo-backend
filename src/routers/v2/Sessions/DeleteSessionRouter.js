// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import SessionsRepo from '../../../repos/SessionsRepo';
import constants from '../../../utils/constants';

class DeleteSessionRouter extends AppDevRouter<Object> {
  constructor () {
    super(constants.REQUEST_TYPES.DELETE);
  }

  getPath (): string {
    return '/sessions/:id/';
  }

  async content (req: Request) {
    const sessionId = req.params.id;
    const user = req.user;

    const session = await SessionsRepo.getSessionById(sessionId);
    if (!session) throw new Error(`Session with id ${sessionId} not found!`);

    if (!await SessionsRepo.isAdmin(sessionId, user)) {
      throw new Error('You are not authorized to delete this session!');
    }

    await SessionsRepo.deleteSessionById(sessionId);
    return null;
  }
}

export default new DeleteSessionRouter().router;
