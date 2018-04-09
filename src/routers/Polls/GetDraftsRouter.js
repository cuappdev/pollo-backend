// @flow
import AppDevEdgeRouter from '../../utils/AppDevEdgeRouter';
import PollsRepo from '../../repos/PollsRepo';
import SessionsRepo from '../../repos/SessionsRepo';
import constants from '../../utils/constants';
import type { APIPoll } from '../APITypes';

class GetDraftsRouter extends AppDevEdgeRouter<APIPoll> {
  constructor () {
    super(constants.REQUEST_TYPES.GET);
  }

  getPath (): string {
    return '/polls/';
  }

  async contentArray (req, pageInfo, error) {
    var polls = await PollsRepo.getDrafts(req.user.id);

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

export default new GetDraftsRouter().router;
