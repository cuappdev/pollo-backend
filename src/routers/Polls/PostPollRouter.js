// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import PollsRepo from '../../repos/PollsRepo';
import GroupsRepo from '../../repos/GroupsRepo';
import constants from '../../utils/constants';

import type { APIPoll } from '../APITypes';

class PostPollRouter extends AppDevRouter<Object> {
  constructor () {
    super(constants.REQUEST_TYPES.POST);
  }

  getPath (): string {
    return '/polls/';
  }

  async content (req: Request): Promise<{ node: APIPoll }> {
    var name = req.body.name;
    const code = req.body.code;
    const user = req.user;
    const groupId = req.body.groupId;

    var group;
    if (groupId) group = await GroupsRepo.getGroupById(groupId);

    if (!name) name = '';
    if (!user) throw new Error('User missing');
    if (!code) throw new Error('Code missing');

    const poll = await PollsRepo.createPoll(name, code, user, group);

    return {
      node: {
        id: poll.id,
        name: poll.name,
        code: poll.code
      }
    };
  }
}

export default new PostPollRouter().router;
