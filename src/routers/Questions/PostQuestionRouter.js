// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import QuestionsRepo from '../../repos/QuestionsRepo';
import PollsRepo from '../../repos/PollsRepo';
import constants from '../../utils/constants';

import type { APIQuestion } from '../APITypes';

class PostQuestionRouter extends AppDevRouter<Object> {
  constructor () {
    super(constants.REQUEST_TYPES.POST);
  }

  getPath (): string {
    return '/poll/:id/question/';
  }

  async content (req: Request): Promise<{ node: APIQuestion }> {
    const id = req.params.id;
    var text = req.body.text;
    var results = req.body.results;

    if (!text) {
      text = '';
    }

    if (!results) {
      results = {};
    }

    const p = await PollsRepo.getPollById(id);
    if (!p) throw new Error(`Couldn't find poll with id ${id}`);

    const question = await QuestionsRepo.createQuestion(text, p, results);

    return {
      node: {
        id: question.id,
        text: question.text,
        results: question.results
      }
    };
  }
}

export default new PostQuestionRouter().router;
