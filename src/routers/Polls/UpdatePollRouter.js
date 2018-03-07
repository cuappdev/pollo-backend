// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import PollsRepo from '../../repos/PollsRepo';
import constants from '../../utils/constants';

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

    var poll = PollsRepo.getPollById(pollId);
    if (deviceId !== poll.deviceId) {
      throw new Error('You are not authorized to update this poll!')
    }

    if (!name) throw new Error('No fields specified to update.');

    poll = await PollsRepo.updatePollById(pollId, name);
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
