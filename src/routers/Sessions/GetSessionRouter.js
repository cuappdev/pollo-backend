// @flow
import AppDevNodeRouter from '../../utils/AppDevNodeRouter';
import SessionsRepo from '../../repos/SessionsRepo';

import type { APISession } from '../APITypes';

class GetSessionRouter extends AppDevNodeRouter<APISession> {
  getPath (): string {
    return '/sessions/:id/';
  }

  async fetchWithId (id: number) {
    const session = await SessionsRepo.getSessionById(id);
    return session && {
      id: session.id,
      name: session.name,
      code: session.code
    };
  }
}

export default new GetSessionRouter().router;
