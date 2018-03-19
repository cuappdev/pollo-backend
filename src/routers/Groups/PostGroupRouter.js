// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import GroupsRepo from '../../repos/GroupsRepo';
import PollsRepo from '../../repos/PollsRepo';
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
    const pollId = req.body.pollId;
    var poll = null;
    var members = [];

    if (!name) name = '';
    if (!user) throw new Error('User missing');
    if (!code) throw new Error('Code missing');

    if (pollId) poll = await PollsRepo.getPollById(pollId);

    const group = await GroupsRepo.createGroup(name, code, user, poll, members);

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
