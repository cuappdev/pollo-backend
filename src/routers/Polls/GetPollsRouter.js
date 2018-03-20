// @flow
import AppDevEdgeRouter from '../../utils/AppDevEdgeRouter';
import GroupsRepo from '../../repos/GroupsRepo';
import constants from '../../utils/constants';
import type { APIPoll } from '../APITypes';

class GetPollsRouter extends AppDevEdgeRouter<APIPoll> {
  constructor () {
    super(constants.REQUEST_TYPES.GET);
  }

  getPath (): string {
    return '/groups/:id/polls/';
  }

  async contentArray (req, pageInfo, error) {
    const id = req.params.id;
    const polls = await GroupsRepo.getPollsById(id);
    return polls
      .filter(Boolean)
      .map(function (poll) {
        return {
          node: {
            id: poll.id,
            name: poll.name,
            code: poll.code
          },
          cursor: poll.createdAt.valueOf()
        };
      });
  }
}

export default new GetPollsRouter().router;
