// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import SessionsRepo from '../../../repos/SessionsRepo';
import constants from '../../../utils/constants';

class GetGroupPollsRouter extends AppDevRouter<Object> {
  constructor () {
    super(constants.REQUEST_TYPES.GET);
  }

  getPath (): string {
    return '/sessions/:id/polls/date/';
  }

  async content (req: Request) {
    const id = req.params.id;
    var polls = await SessionsRepo.getPollsBeforeDate(id);
    if (!polls) throw new Error(`Problem getting polls from group id: ${id}!`);

    // Show only shared polls for members
    if (!await SessionsRepo.isAdmin(id, req.user)) {
      polls = polls.filter(function (p) {
        return p && p.shared;
      });
    }

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
          results: poll.results
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

export default new GetGroupPollsRouter().router;
