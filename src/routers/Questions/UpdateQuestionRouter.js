// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import QuestionsRepo from '../../repos/QuestionsRepo';
import constants from '../../utils/constants';

class UpdateQuestionRouter extends AppDevRouter {
  constructor () {
    super(constants.REQUEST_TYPES.PUT);
  }

  getPath (): string {
    return '/question/:id/';
  }

  async content (req: Request) {
    const qId = req.params.id;
    const text = req.body.text;

    var data = req.body.data;
    if (data && typeof data !== 'object') {
      throw new Error('Data must be a valid json');
    }
    if (!text && !data) throw new Error('No fields specified to update.');
    const q = await QuestionsRepo.updateQuestionById(qId, text, data);
    if (!q) throw new Error(`Question with id ${qId} was not found!`);

    var node;
    if (q.type === constants.QUESTION_TYPES.FREE_RESPONSE) {
      node = {
        id: String(q.id),
        text: q.text,
        type: q.type
      };
    } else if (q.type === constants.QUESTION_TYPES.MULTIPLE_CHOICE ||
        q.type === constants.QUESTION_TYPES.MULTIPLE_ANSWER ||
        q.type === constants.QUESTION_TYPES.RANKING) {
      node = {
        id: String(q.id),
        text: q.text,
        type: q.type,
        options: q.data.options,
        answer: q.data.answer
      };
    } else {
      throw new Error('Invalid question type');
    }
    return {
      node: node
    };
  }
}

export default new UpdateQuestionRouter().router;
