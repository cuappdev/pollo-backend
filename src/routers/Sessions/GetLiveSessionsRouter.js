// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import constants from '../../utils/constants';

class GetLiveSessionsRouter extends AppDevRouter<Object> {
  constructor () {
    super(constants.REQUEST_TYPES.POST);
  }

  getPath (): string {
    return '/sessions/live/';
  }

  async content (req: Request) {
    const codes = req.body.codes;

    if (!codes) throw new Error('Session codes are missing!');

    const sessions = await req.app.sessionManager.liveSessions(codes);
    return sessions
      .filter(Boolean)
      .map(session => ({
        node: {
          id: session.id,
          name: session.name,
          code: session.code
        }
      }));
  }
}

export default new GetLiveSessionsRouter().router;
