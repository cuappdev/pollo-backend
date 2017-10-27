// @flow
import type { APIQuestion } from './APITypes'

import AppDevEdgeRouter from '../utils/AppDevEdgeRouter';
import constants from '../utils/constants';
import QuestionsRepo from '../repos/QuestionsRepo'
import { Request } from 'express';

class GetQuestionsRouter extends AppDevEdgeRouter<APIQuestion> {

  constructor() {
    super(constants.REQUEST_TYPES.GET);
  }

  getPath(): string {
    return '/lecture/:id/questions/';
  }

  async contentArray(req, pageInfo, error) {

    const id = req.params.id
    const questions = await QuestionsRepo
      .paginateQuestionByLectureId(id, pageInfo.cursor, pageInfo.count)

    return questions
      .filter(Boolean)
      .map(question => ({
        node: {
          id: question.id,
          text: question.text,
          type: question.type,
          data: question.data,
        },
        cursor: question.createdAt.valueOf(),
      }));
  }
}

export default new GetQuestionsRouter().router;