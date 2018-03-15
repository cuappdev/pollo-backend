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
    return '/polls/:id/question/';
  }

  async content (req: Request): Promise<{ node: APIQuestion }> {
    const pollId = req.params.pollId;
    var text = req.body.text;
    var results = req.body.results;
    var user = req.user;

    if (!text) text = '';
    if (!results) results = {};

    const poll = await PollsRepo.getPollById(pollId);
    if (!poll) throw new Error(`Couldn't find poll with id ${pollId}`);

    if (PollsRepo.isAdmin(pollId, user)) {
      throw new Error('You are not authorized to post a question!');
    }

    const question = await QuestionsRepo.createQuestion(text, poll, results);

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
