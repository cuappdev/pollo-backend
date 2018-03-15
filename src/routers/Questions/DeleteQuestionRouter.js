// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import QuestionsRepo from '../../repos/QuestionsRepo';
import constants from '../../utils/constants';
import PollsRepo from '../../repos/PollsRepo';

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

    const poll = await QuestionsRepo.getPollFromQuestionId(questionId);
    if (!poll) {
      throw new Error(`Couldn't find poll with question ${questionId}`);
    }
    if (PollsRepo.isAdmin(poll.id, user)) {
      throw new Error('You are not authorized to delete this question!');
    }
    console.log(":DLKFJLDKSJFLKSDJFLKJDLSKSJFLKSDJFLSKDJFLDKJFDKLFS");
    await QuestionsRepo.deleteQuestionById(questionId);
    return null;
  }
}

export default new DeleteQuestionRouter().router;
