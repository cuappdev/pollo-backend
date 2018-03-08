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
    return '/questions/:id/:deviceId/';
  }

  async content (req: Request) {
    const questionId = req.params.id;
    const deviceId = req.params.deviceId;

    const poll = await QuestionsRepo.getPollFromQuestionId(questionId);
    if (!poll) {
      throw new Error(`Couldn't find poll with question ${questionId}`);
    }
    if (poll.deviceId !== deviceId) {
      throw new Error('Not authorized to delete this question!');
    }
    await QuestionsRepo.deleteQuestionById(questionId);
    return null;
  }
}

export default new DeleteQuestionRouter().router;
