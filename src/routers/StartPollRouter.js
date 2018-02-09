// @flow
import AppDevRouter from '../utils/AppDevRouter';
import constants from '../utils/constants';
import PollManager from '../PollManager';
import PollsRepo from '../repos/PollsRepo';
import {Request} from 'express';

class StartPollRouter extends AppDevRouter<Object> {
  constructor () {
    super(constants.REQUEST_TYPES.POST);
  }

  getPath (): string {
    return '/polls/:id/start/';
  }

  async content (req: Request) {
    const id = req.params.id;
    const poll = await PollsRepo.getPollById(id);

    if (!poll) {
      throw new Error(`No poll with id ${id} found.`);
    }

    const { port } = await PollManager.startNewPoll(poll);
    return {port};
  }
}

export default new StartPollRouter().router;
