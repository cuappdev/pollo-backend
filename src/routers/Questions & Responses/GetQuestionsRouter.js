// @flow
import type {
  FreeResponseQuestion,
  MultipleChoiceQuestion,
  MultipleAnswerQuestion,
  APIQuestion
} from '../APITypes';

import AppDevEdgeRouter from '../../utils/AppDevEdgeRouter';
import constants from '../../utils/constants';
import QuestionsRepo from '../../repos/QuestionsRepo';
import { Request } from 'express';

class GetQuestionsRouter extends AppDevEdgeRouter<APIQuestion> {
  constructor () {
    super(constants.REQUEST_TYPES.GET);
  }

  getPath (): string {
    return '/lectures/:id/questions/';
  }

  async contentArray (req, pageInfo, error) {
    const id = req.params.id;
    const questions = await QuestionsRepo
      .paginateQuestionByLectureId(id, pageInfo.cursor, pageInfo.count);

    const nodes = questions
      .filter(Boolean)
      .map(function (question) {
        var node;
        if (question.type === constants.QUESTION_TYPES.FREE_RESPONSE) {
          var f: FreeResponseQuestion = {
            id: String(question.id),
            text: question.text,
            type: question.type
          };
          node = f;
        } else if (question.type === constants.QUESTION_TYPES.MULTIPLE_CHOICE) {
          var m: MultipleChoiceQuestion = {
            id: String(question.id),
            text: question.text,
            type: question.type,
            options: question.data.options,
            answer: question.data.answer
          };
          node = m;
        } else {
          var q: MultipleAnswerQuestion = {
            id: String(question.id),
            text: question.text,
            type: question.type,
            options: question.data.options,
            answer: question.data.answer
          };
          node = q;
        }
        return {
          node: node,
          cursor: question.createdAt.valueOf()
        };
      });

    return nodes;
  }
}

export default new GetQuestionsRouter().router;
