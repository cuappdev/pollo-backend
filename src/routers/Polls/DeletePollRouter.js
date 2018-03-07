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
    return '/polls/:id/:deviceId/';
  }

  async content (req: Request) {
    const pollId = req.params.id;
    const deviceId = req.params.deviceId;

    const poll = await PollsRepo.getPollById(pollId);
    if (!poll) throw new Error(`Poll with id ${pollId} not found!`);

    if (deviceId !== poll.deviceId) {
      throw new Error('You are not authorized to delete this poll!');
    }

    await PollsRepo.deletePollById(pollId);
    return null;
  }
}

export default new DeletePollRouter().router;
