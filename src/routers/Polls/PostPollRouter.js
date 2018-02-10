// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import PollsRepo from '../../repos/PollsRepo';
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

    if (!name) {
      name = '';
    }
    if (!code) throw new Error('Code missing');

    const poll = await PollsRepo.createPoll(name, code);

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
