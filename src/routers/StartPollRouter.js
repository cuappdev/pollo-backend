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
    return '/start/poll/';
  }

  async content (req: Request) {
    const id = req.body.id;
    const code = req.body.code;
    var name = req.body.name;
    if (!name) name = '';
    var poll = await PollsRepo.getPollById(id);

    if (!id && !code) {
      throw new Error('Poll id or code required.');
    }

    if (!id) {
      poll = await PollsRepo.createPoll(name, code);
    }

    if (!poll) {
      throw new Error(`No poll with id ${id} found.`);
    }

    const { port } = await PollManager.startNewPoll(poll);
    return {port};
  }
}

export default new StartPollRouter().router;
