// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import PollsRepo from '../../repos/PollsRepo';
import SessionsRepo from '../../repos/SessionsRepo';
import constants from '../../utils/constants';

import type { APIPoll } from '../APITypes';

class PostPollToSessionRouter extends AppDevRouter<Object> {
  constructor () {
    super(constants.REQUEST_TYPES.POST);
  }

  getPath (): string {
    return '/sessions/:id/polls/';
  }

  async content (req: Request): Promise<{ node: APIPoll }> {
    const sessionId = req.params.id;
    var text = req.body.text;
    var results = req.body.results;
    var shared = req.body.shared;
    var user = req.user;

    if (!text) text = '';
    if (!results) results = {};
    if (shared === null) shared = false;

    const session = await SessionsRepo.getSessionById(sessionId);
    if (!session) throw new Error(`Couldn't find session with id ${sessionId}`);

    if (!await SessionsRepo.isAdmin(sessionId, user)) {
      throw new Error('You are not authorized to post a poll!');
    }

    const poll =
      await PollsRepo.createPoll(text, session, results, shared);

    return {
      node: {
        id: poll.id,
        text: poll.text,
        results: poll.results
      }
    };
  }
}

export default new PostPollToSessionRouter().router;
