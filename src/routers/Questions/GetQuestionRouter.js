// @flow
import AppDevNodeRouter from '../../utils/AppDevNodeRouter';
import QuestionsRepo from '../../repos/QuestionsRepo';
import constants from '../../utils/constants';

import type {
  FreeResponseQuestion,
  MultipleChoiceQuestion,
  MultipleAnswerQuestion,
  APIQuestion
} from 'clicker-types';

class GetQuestion extends AppDevNodeRouter<APIQuestion> {
  getPath (): string {
    return '/question/:id/';
  }

  async fetchWithId (id: number) {
    const question = await QuestionsRepo.getQuestionById(id);
    if (!question) throw new Error(`Could not find question with id ${id}!`);
    var node;
    switch (question.type) {
    case constants.QUESTION_TYPES.FREE_RESPONSE:
      const f: FreeResponseQuestion = {
        id: String(question.id),
        text: question.text,
        type: question.type
      };
      node = f;
      break;
    case constants.QUESTION_TYPES.MULTIPLE_CHOICE:
      const m: MultipleChoiceQuestion = {
        id: String(question.id),
        text: question.text,
        type: question.type,
        options: question.data.options,
        answer: question.data.answer
      };
      node = m;
      break;
    default:
      const q: MultipleAnswerQuestion = {
        id: String(question.id),
        text: question.text,
        type: question.type,
        options: question.data.options,
        answer: question.data.answer
      };
      node = q;
      break;
    }

    return question && node;
  }
}

export default new GetQuestion().router;
