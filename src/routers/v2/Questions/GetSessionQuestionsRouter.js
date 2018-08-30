// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import SessionsRepo from '../../../repos/SessionsRepo';
import constants from '../../../utils/constants';

class GetSessionQuestionsRouter extends AppDevRouter<Object> {
  constructor() {
    super(constants.REQUEST_TYPES.GET);
  }

  getPath(): string {
    return '/sessions/:id/questions/date/';
  }

  async content(req: Request) {
    const { id } = req.params;
    const questions = await SessionsRepo.getQuestions(id);
    if (!questions) {
      throw new Error(`Problem getting questions from session id: ${id}!`);
    }
    // Date mapped to list of questions
    const questionsByDate = {};
    for (let i = 0; i < questions.length; i += 1) {
      const question = questions[i];
      if (question) {
        let date = (new Date(1000 * question.createdAt)).toLocaleString();
        date = date.substring(0, date.indexOf(','));
        const q = {
          id: question.id,
          text: question.text
        };
        if (questionsByDate[date]) {
          questionsByDate[date].push(q);
        } else {
          questionsByDate[date] = [q];
        }
      }
    }
    return questionsByDate;
  }
}

export default new GetSessionQuestionsRouter().router;
