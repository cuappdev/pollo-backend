// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import constants from '../../utils/constants';
import UsersRepo from '../../repos/UsersRepo';

class GetGroupsRouter extends AppDevRouter<Object> {
  constructor () {
    super(constants.REQUEST_TYPES.GET);
  }

  getPath (): string {
    return '/groups/:role/';
  }

  async content (req: Request) {
    const role = req.params.role;
    var sessions = await UsersRepo.getSessionsById(req.user.id, role);
    if (!sessions) throw new Error('Can\'t find groups for user!');
    return sessions
      .filter(Boolean)
      .filter(function (s) {
        return s.isGroup;
      })
      .map(session => ({
        node: {
          id: session.id,
          name: session.name,
          code: session.code,
          isGroup: session.isGroup,
          isLive: req.app.sessionManager.isLive(session.code)
        }
      }));
  }
}

export default new GetGroupsRouter().router;
