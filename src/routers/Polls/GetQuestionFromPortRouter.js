// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import constants from '../../utils/constants';
import PollManager from '../../PollManager';

class GetQuestionFromPortRouter extends AppDevRouter<Object> {
  constructor () {
    super(constants.REQUEST_TYPES.GET);
  }

  getPath (): string {
    return '/polls/question/:port/';
  }

  async content (req: Request) {
    const port = parseInt(req.params.port);

    if (!port) throw new Error('Port is missing!');

    const question = PollManager.questionForPort(port);

    if (!question) throw new Error('No question found!');
    return question;
  }
}

export default new GetQuestionFromPortRouter().router;
