// @flow
import { Request } from 'express';
import AppDevNodeRouter from '../../../utils/AppDevNodeRouter';
import QuestionsRepo from '../../../repos/QuestionsRepo';

import type { APIQuestion } from '../APITypes';

class GetQuestionRouter extends AppDevNodeRouter<APIQuestion> {
  getPath(): string {
    return '/questions/:id/';
  }

  async fetchWithId(id: number, req: Request) {
    const question = await QuestionsRepo.getQuestionById(id);
    if (!question) throw new Error(`Question with id ${id} cannot be found`);

    return question && {
      id: question.id,
      text: question.text
    };
  }
}

export default new GetQuestionRouter().router;
