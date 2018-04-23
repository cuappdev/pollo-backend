// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import SessionsRepo from '../../../repos/SessionsRepo';
import constants from '../../../utils/constants';

import type { APISession } from '../APITypes';

class PostSessionRouter extends AppDevRouter<Object> {
  constructor () {
    super(constants.REQUEST_TYPES.POST);
  }

  getPath (): string {
    return '/sessions/';
  }

  async content (req: Request): Promise<{ node: APISession }> {
    var name = req.body.name;
    const code = req.body.code;
    var isGroup = req.body.isGroup;
    const user = req.user;

    if (!name) name = '';
    if (!user) throw new Error('User missing');
    if (!code) throw new Error('Code missing');
    if (isGroup === null || isGroup === undefined) isGroup = false;

    const session = await SessionsRepo.createSession(name, code, user, isGroup);

    return {
      node: {
        id: session.id,
        name: session.name,
        code: session.code,
        isGroup: session.isGroup
      }
    };
  }
}

export default new PostSessionRouter().router;
