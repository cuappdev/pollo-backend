// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import SessionsRepo from '../../../repos/SessionsRepo';
import UsersRepo from '../../../repos/UsersRepo';
import constants from '../../../utils/constants';

import type { APIPoll } from '../APITypes';

class UpdatePollRouter extends AppDevRouter<Object> {
  constructor () {
    super(constants.REQUEST_TYPES.PUT);
  }

  getPath (): string {
    return '/polls/:id/';
  }

  async content (req: Request): Promise<{ node: APIPoll }> {
    const name = req.body.name;
    const pollId = req.params.id;
    const deviceId = req.body.deviceId;

    var poll = await SessionsRepo.getSessionId(pollId);
    if (!poll) throw new Error(`Poll with id ${pollId} was not found!`);

    const user = await UsersRepo.getUserByGoogleId(deviceId);

    if (!user || await SessionsRepo.isAdmin(pollId, user)) {
      throw new Error('You are not authorized to update this poll!');
    }

    if (!name) throw new Error('No fields specified to update.');

    poll = await SessionsRepo.updateSessionById(pollId, name);
    if (!poll) throw new Error(`Poll with id ${pollId} was not found!`);
    return {
      node: {
        id: poll.id,
        name: poll.name,
        code: poll.code
      }
    };
  }
}

export default new UpdatePollRouter().router;
