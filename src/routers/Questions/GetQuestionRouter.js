// @flow
import AppDevNodeRouter from '../../utils/AppDevNodeRouter';
import QuestionsRepo from '../../repos/QuestionsRepo';
import PollsRepo from '../../repos/PollsRepo';
import { Request } from 'express';

import type { APIQuestion } from '../APITypes';

class GetQuestionRouter extends AppDevNodeRouter<APIQuestion> {
  getPath (): string {
    return '/questions/:id/';
  }

  async fetchWithId (id: number, req: Request) {
    const question = await QuestionsRepo.getQuestionById(id);
    const poll = await QuestionsRepo.getPollFromQuestionId(question.id);

    if (!question.shared && !await PollsRepo.isAdmin(poll.id, req.user)) {
      throw new Error('This question is not shared with you');
    }

    return question && {
      id: question.id,
      text: question.text,
      results: question.results
    };
  }
}

export default new GetQuestionRouter().router;
