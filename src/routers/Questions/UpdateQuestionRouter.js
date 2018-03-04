// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import QuestionsRepo from '../../repos/QuestionsRepo';
import constants from '../../utils/constants';

import type { APIQuestion } from '../APITypes';

class UpdateQuestionRouter extends AppDevRouter<Object> {
  constructor () {
    super(constants.REQUEST_TYPES.PUT);
  }

  getPath (): string {
    return '/questions/:id/';
  }

  async content (req: Request): Promise<{ node: APIQuestion }> {
    const questionId = req.params.id;
    var text = req.body.text;
    var results = req.body.results;

    if (!results && !text) throw new Error('No fields specified to update.');

    const question = await QuestionsRepo.updateQuestionById(questionId, text, results);
    if (!question) throw new Error(`Poll with id ${questionId} was not found!`);

    return {
      node : {
        id: question.id,
        text: question.text,
        results: question.results
      }
    };

  }
}

export default new UpdateQuestionRouter().router;
