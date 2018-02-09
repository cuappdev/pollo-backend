// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import PollsRepo from '../../repos/PollsRepo';
import constants from '../../utils/constants';

class DeletePollRouter extends AppDevRouter<Object> {
  constructor () {
    super(constants.REQUEST_TYPES.DELETE);
  }

  getPath (): string {
    return '/polls/:id/';
  }

  async content (req: Request) {
    const pollId = req.params.id;
    await PollsRepo.deletePollById(pollId);
    return null;
  }
}

export default new DeletePollRouter().router;
