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
    return '/questions/:id/';
  }

  async content (req: Request) {
    const questionId = req.params.id;
    await QuestionsRepo.deleteQuestionById(questionId);
    return null;
  }
}

export default new DeleteQuestionRouter().router;
