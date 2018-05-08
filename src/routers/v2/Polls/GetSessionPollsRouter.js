// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import SessionsRepo from '../../../repos/SessionsRepo';
import constants from '../../../utils/constants';

class GetSessionPollsRouter extends AppDevRouter<Object> {
  constructor () {
    super(constants.REQUEST_TYPES.GET);
  }

  getPath (): string {
    return '/sessions/:id/polls/date/';
  }

  async content (req: Request) {
    const id = req.params.id;
    var polls = await SessionsRepo.getPolls(id);
    if (!polls) throw new Error(`Problem getting polls from session id: ${id}!`);
    const isAdmin = await SessionsRepo.isAdmin(id, req.user);

    // Date mapped to list of polls
    const pollsByDate = {};
    for (var i = 0; i < polls.length; i++) {
      const poll = polls[i];
      if (poll) {
        var date = (new Date(1000 * poll.createdAt)).toLocaleString();
        date = date.substring(0, date.indexOf(','));
        const p = {
          id: poll.id,
          text: poll.text,
          results: poll.results,
          shared: poll.shared,
          answer: isAdmin ? null : poll.userAnswers[req.user.googleId]
        };
        if (pollsByDate[date]) {
          pollsByDate[date].push(p);
        } else {
          pollsByDate[date] = [p];
        }
      }
    }
    return pollsByDate;
  }
}

export default new GetSessionPollsRouter().router;
