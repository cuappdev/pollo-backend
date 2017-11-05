// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import QuestionsRepo from '../../repos/QuestionsRepo';
import constants from '../../utils/constants';

class PostQuestionRouter extends AppDevRouter {
  constructor () {
    super(constants.REQUEST_TYPES.POST);
  }

  getPath (): string {
    return '/lectures/:id/questions/';
  }

  async content (req: Request) {
    const lectureId = req.params.id;
    const text = req.body.text;
    const type = req.body.type;

    // data must follow this format (ex for multiple choice):
    // '{"options": {"A": "2", "B": "1"}, "answer": "A"}'
    var data = req.body.data;
    try {
      data = JSON.parse(data);
    } catch (e) {
      throw new Error('Invalid json in data field');
    }
    if (!text) throw new Error('Text missing');
    if (!type) throw new Error('Question type missing');
    if (!data) throw new Error('Question data missing');
    const q = await QuestionsRepo.createQuestion(text, type, data, lectureId);

    var node;
    if (type === constants.QUESTION_TYPES.FREE_RESPONSE) {
      node = {
        id: String(q.id),
        text: text,
        type: type
      };
    } else if (type === constants.QUESTION_TYPES.MULTIPLE_CHOICE ||
        type === constants.QUESTION_TYPES.MULTIPLE_ANSWER ||
        type === constants.QUESTION_TYPES.RANKING) {
      node = {
        id: String(q.id),
        text: text,
        type: type,
        options: data.options,
        answer: data.answer
      };
    } else {
      throw new Error('Invalid question type');
    }
    return {
      node: node
    };
  }
}

export default new PostQuestionRouter().router;