// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import SessionsRepo from '../../../repos/SessionsRepo';
import UsersRepo from '../../../repos/UsersRepo';
import constants from '../../../utils/constants';

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
    const deviceId = req.body.deviceId;

    if (!name) name = '';
    if (!code) throw new Error('Code missing');
    if (!deviceId) throw new Error('Device id missing');

    var user = await UsersRepo.getUserByGoogleId(deviceId);
    if (!user) {
      user = await UsersRepo.createDummyUser(deviceId);
    }

    const poll = await SessionsRepo.createSession(name, code, user, false);

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
