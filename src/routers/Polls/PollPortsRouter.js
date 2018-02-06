// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import PollManager from '../../PollManager';
import constants from '../../utils/constants';

/**
 * In theory this router should be temporary
 * though this is till tbd.
 * ask @mrkev for more info.
 */
class PollPortsRouter extends AppDevRouter<Object> {
  constructor () {
    super(constants.REQUEST_TYPES.GET);
  }

  getPath (): string {
    return '/polls/:id/ports/';
  }

  async content (req: Request) {
    const pollId = parseInt(req.params.id);
    if (Number.isNaN(pollId)) {
      throw new Error(`Invalid poll id ${req.params.id}`);
    }
    const ports = PollManager.portsForPoll(pollId);
    return {
      ports
    };
  }
}

export default new PollPortsRouter().router;
