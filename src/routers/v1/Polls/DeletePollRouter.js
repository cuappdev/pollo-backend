// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import SessionsRepo from '../../../repos/SessionsRepo';
import constants from '../../../utils/constants';

class DeletePollRouter extends AppDevRouter<Object> {
  constructor () {
    super(constants.REQUEST_TYPES.DELETE, false);
  }

  getPath (): string {
    return '/polls/:id/:deviceId/';
  }

  async content (req: Request) {
    const pollId = req.params.id;
    const deviceId = req.params.deviceId;

    const poll = await SessionsRepo.getSessionId(pollId);
    if (!poll) throw new Error(`Poll with id ${pollId} not found!`);

    const users = await SessionsRepo.getUsersBySessionId(pollId, 'admin');
    if (users && users[0] && deviceId !== users[0].googleId) {
      throw new Error('You are not authorized to delete this poll!');
    }

    await SessionsRepo.deleteSessionById(pollId);
    return null;
  }
}

export default new DeletePollRouter().router;
