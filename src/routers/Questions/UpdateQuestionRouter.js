// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import QuestionsRepo from '../../repos/QuestionsRepo';
import constants from '../../utils/constants';
import PollsRepo from '../../repos/PollsRepo';

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
    var user = req.user;

    if (!results && !text) throw new Error('No fields specified to update.');

    const poll = await QuestionsRepo.getPollFromQuestionId(questionId);
    if (!poll) throw new Error(`Question with id ${questionId} has no poll!`);

    if (await PollsRepo.isAdmin(poll.id, user)) {
      throw new Error('You are not authorized to update this question!');
    }
    const question = await QuestionsRepo.updateQuestionById(questionId, text,
      results);
    if (!question) {
      throw new Error(`Question with id ${questionId} was not found!`);
    }

    return {
      node: {
        id: question.id,
        text: question.text,
        results: question.results
      }
    };
  }
}

export default new UpdateQuestionRouter().router;
