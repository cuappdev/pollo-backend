// @flow
import AppDevRouter from '../utils/AppDevRouter';
import constants from '../utils/constants';
import PollManager from '../PollManager';
import PollsRepo from '../repos/PollsRepo';
import { Request } from 'express';

class EndPollRouter extends AppDevRouter<Object> {
  constructor () {
    super(constants.REQUEST_TYPES.POST);
  }

  getPath (): string {
    return '/polls/:id/end/';
  }

  async content (req: Request) {
    const id = req.params.id;
    const poll = await PollsRepo.getPollById(id);

    if (!poll) {
      throw new Error(`No poll with id ${id} found.`);
    }

    PollManager.endPoll(poll);
    return {};
  }
}

export default new EndPollRouter().router;
