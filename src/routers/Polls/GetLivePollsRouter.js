// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import constants from '../../utils/constants';
import PollManager from '../../PollManager';

class GetLivePollsRouter extends AppDevRouter<Object> {
  constructor () {
    super(constants.REQUEST_TYPES.POST);
  }

  getPath (): string {
    return '/polls/live/';
  }

  async content (req: Request) {
    const codes = req.body.codes;

    if (!codes) throw new Error('Poll codes are missing!');

    const polls = await PollManager.livePolls(codes);
    return polls
      .filter(Boolean)
      .map(poll => ({
        node: {
          id: poll.id,
          name: poll.name,
          code: poll.code
        }
      }));
  }
}

export default new GetLivePollsRouter().router;
