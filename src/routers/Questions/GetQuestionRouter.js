// @flow
import AppDevNodeRouter from '../../utils/AppDevNodeRouter';
import QuestionsRepo from '../../repos/QuestionsRepo';

import type { APIQuestion } from '../APITypes';

class GetQuestionRouter extends AppDevNodeRouter<APIQuestion> {
  getPath (): string {
    return '/questions/:id/';
  }

  async fetchWithId (id: number) {
    const question = await QuestionsRepo.getQuestionById(id);
    return question && {
      id: question.id,
      text: question.text,
      results: question.results
    };
  }
}

export default new GetQuestionRouter().router;
