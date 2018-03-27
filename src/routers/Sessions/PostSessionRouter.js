// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import SessionsRepo from '../../repos/SessionsRepo';
import GroupsRepo from '../../repos/GroupsRepo';
import constants from '../../utils/constants';

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
    const user = req.user;
    const groupId = req.body.groupId;

    var group;
    if (groupId) group = await GroupsRepo.getGroupById(groupId);

    if (!name) name = '';
    if (!user) throw new Error('User missing');
    if (!code) throw new Error('Code missing');

    const session = await SessionsRepo.createSession(name, code, user, group);

    return {
      node: {
        id: session.id,
        name: session.name,
        code: session.code
      }
    };
  }
}

export default new PostSessionRouter().router;
