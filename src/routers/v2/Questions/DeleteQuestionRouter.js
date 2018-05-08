// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import QuestionsRepo from '../../../repos/QuestionsRepo';
import SessionsRepo from '../../../repos/SessionsRepo';
import constants from '../../../utils/constants';

class DeleteQuestionRouter extends AppDevRouter<Object> {
  constructor () {
    super(constants.REQUEST_TYPES.DELETE);
  }

  getPath (): string {
    return '/questions/:id/';
  }

  async content (req: Request) {
    const questionId = req.params.id;
    const user = req.user;

    const session = await QuestionsRepo.getSessionFromQuestionId(questionId);
    if (!session) {
      throw new Error(`Couldn't find session with question ${questionId}`);
    }
    if (!await SessionsRepo.isAdmin(session.id, user) &&
          !await QuestionsRepo.isOwnerById(questionId, user)) {
      throw new Error('You are not authorized to delete this question!');
    }
    await QuestionsRepo.deleteQuestionById(questionId);
    return null;
  }
}

export default new DeleteQuestionRouter().router;
