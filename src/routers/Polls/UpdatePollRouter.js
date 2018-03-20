// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import PollsRepo from '../../repos/PollsRepo';
import constants from '../../utils/constants';

import type { APIPoll } from '../APITypes';

class UpdatePollRouter extends AppDevRouter<APIPoll> {
  constructor () {
    super(constants.REQUEST_TYPES.PUT);
  }

  getPath (): string {
    return '/polls/:id/';
  }

  async content (req: Request): Promise<{ node: APIPoll }> {
    const name = req.body.name;
    const pollId = req.params.id;
    const user = req.user;

    if (!name) throw new Error('No fields specified to update.');

    var poll = await PollsRepo.getPollById(pollId);
    if (!poll) throw new Error(`Poll with id ${pollId} was not found!`);

    if (!await PollsRepo.isAdmin(pollId, user)) {
      throw new Error('You are not authorized to update this poll!');
    }

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
