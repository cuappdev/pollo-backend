// @flow
import AppDevEdgeRouter from '../../utils/AppDevEdgeRouter';
import GroupsRepo from '../../repos/GroupsRepo';
import constants from '../../utils/constants';
import type { APISession } from '../APITypes';

class GetSessionsRouter extends AppDevEdgeRouter<APISession> {
  constructor () {
    super(constants.REQUEST_TYPES.GET);
  }

  getPath (): string {
    return '/groups/:id/sessions/';
  }

  async contentArray (req, pageInfo, error) {
    const id = req.params.id;
    const sessions = await GroupsRepo.getSessionsById(id);
    return sessions
      .filter(Boolean)
      .map(function (session) {
        return {
          node: {
            id: session.id,
            name: session.name,
            code: session.code
          },
          cursor: session.createdAt.valueOf()
        };
      });
  }
}

export default new GetSessionsRouter().router;
