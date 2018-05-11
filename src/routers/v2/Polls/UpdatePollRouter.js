// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import PollsRepo from '../../../repos/PollsRepo';
import constants from '../../../utils/constants';
import SessionsRepo from '../../../repos/SessionsRepo';

import type { APIPoll } from '../APITypes';

class UpdatePollRouter extends AppDevRouter<Object> {
  constructor () {
    super(constants.REQUEST_TYPES.PUT);
  }

  getPath (): string {
    return '/polls/:id/';
  }

  async content (req: Request): Promise<{ node: APIPoll }> {
    const pollId = req.params.id;
    var text = req.body.text;
    var results = req.body.results;
    var shared = req.body.shared;
    var user = req.user;

    if (!results && !text && shared === null) {
      throw new Error('No fields specified to update.');
    }

    const session = await PollsRepo.getSessionFromPollId(pollId);
    if (!session) throw new Error(`Poll with id ${pollId} has no session!`);

    if (!await SessionsRepo.isAdmin(session.id, user)) {
      throw new Error('You are not authorized to update this poll!');
    }
    const poll = await PollsRepo.updatePollById(pollId, text,
      results, shared);
    if (!poll) {
      throw new Error(`Poll with id ${pollId} was not found!`);
    }

    return {
      node: {
        id: poll.id,
        text: poll.text,
        results: poll.results,
        shared: poll.shared,
        type: poll.type,
        answer: null
      }
    };
  }
}

export default new UpdatePollRouter().router;
