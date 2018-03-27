// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import GroupsRepo from '../../repos/GroupsRepo';
import UsersRepo from '../../repos/UsersRepo';
import SessionsRepo from '../../repos/SessionsRepo';
import constants from '../../utils/constants';

import type { APIGroup } from '../APITypes';

class PostGroupRouter extends AppDevRouter<APIGroup> {
  constructor () {
    super(constants.REQUEST_TYPES.POST);
  }

  getPath (): string {
    return '/groups/';
  }

  async content (req: Request): Promise<{ node: APIGroup }> {
    var name = req.body.name;
    const code = req.body.code;
    const user = req.user;
    const sessionId = req.body.sessionId;
    const memberIds = req.body.memberIds;

    var session = null;
    var members = [];

    if (!name) name = '';
    if (!user) throw new Error('User missing');
    if (!code) throw new Error('Code missing');

    if (sessionId) session = await SessionsRepo.getSessionById(sessionId);
    if (memberIds) members = await UsersRepo.getUsersFromIds(memberIds);

    const group = await GroupsRepo.createGroup(name, code, user, session, members);

    return {
      node: {
        id: group.id,
        name: group.name,
        code: group.code
      }
    };
  }
}

export default new PostGroupRouter().router;
