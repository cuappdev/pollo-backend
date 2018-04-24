// @flow
import AppDevEdgeRouter from '../../../utils/AppDevEdgeRouter';
import PollsRepo from '../../../repos/PollsRepo';
import SessionsRepo from '../../../repos/SessionsRepo';
import constants from '../../../utils/constants';
import type { APIPoll } from '../APITypes';

class GetPollsRouter extends AppDevEdgeRouter<APIPoll> {
  constructor () {
    super(constants.REQUEST_TYPES.GET);
  }

  getPath (): string {
    return '/sessions/:id/polls/';
  }

  async contentArray (req, pageInfo, error) {
    const id = req.params.id;
    var polls;

    if (await SessionsRepo.isAdmin(id, req.user)) {
      polls = await PollsRepo.getPollsFromSessionId(id);
    } else {
      polls = await PollsRepo.getSharedPollsFromSessionId(id);
    }

    return polls
      .filter(Boolean)
      .map(function (poll) {
        return {
          node: {
            id: poll.id,
            text: poll.text,
            results: poll.results
          },
          cursor: poll.createdAt.valueOf()
        };
      });
  }
}

export default new GetPollsRouter().router;
