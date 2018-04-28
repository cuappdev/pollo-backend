// @flow
import AppDevNodeRouter from '../../../utils/AppDevNodeRouter';
import PollsRepo from '../../../repos/PollsRepo';
import SessionsRepo from '../../../repos/SessionsRepo';
import { Request } from 'express';

import type { APIPoll } from '../APITypes';

class GetPollRouter extends AppDevNodeRouter<APIPoll> {
  getPath (): string {
    return '/polls/:id/';
  }

  async fetchWithId (id: number, req: Request) {
    const poll = await PollsRepo.getPollById(id);
    if (!poll) throw new Error(`Poll with id ${id} cannot be found`);

    const session = await PollsRepo.getSessionFromPollId(poll.id);
    if (!session) throw new Error(`Session with id ${id} cannot be found`);

    const isAdmin = await SessionsRepo.isAdmin(session.id, req.user);
    if (!poll.shared && !isAdmin) {
      throw new Error('This poll is not shared with you');
    }

    return poll && {
      id: poll.id,
      text: poll.text,
      results: poll.results,
      answer: isAdmin ? null : poll.userAnswers[req.user.googleId]
    };
  }
}

export default new GetPollRouter().router;
