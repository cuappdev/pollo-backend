// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import QuestionsRepo from '../../repos/QuestionsRepo';
import constants from '../../utils/constants';

class DeleteQuestionRouter extends AppDevRouter<Object> {
  constructor () {
    super(constants.REQUEST_TYPES.DELETE);
  }

  getPath (): string {
    return '/question/:id/';
  }

  async content (req: Request) {
    const qId = req.params.id;
    await QuestionsRepo.deleteQuestionById(qId);
    return null;
  }
}

export default new DeleteQuestionRouter().router;
