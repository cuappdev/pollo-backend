// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';
import GroupsRepo from '../../../repos/GroupsRepo';

import type { APIQuestion } from '../APITypes';

class GetQuestionsRouter extends AppDevRouter<APIQuestion[]> {
  constructor() {
    super(constants.REQUEST_TYPES.GET);
  }

  getPath(): string {
    return '/sessions/:id/questions/';
  }

  async content(req: Request) {
    const { id } = req.params;
    const questions = await GroupsRepo.getQuestions(id);

    return questions
      .filter(Boolean)
      .map(question => ({
        id: question.id,
        text: question.text,
        createdAt: question.createdAt.valueOf(),
      }));
  }
}

export default new GetQuestionsRouter().router;
