// @flow
import AppDevEdgeRouter from '../../utils/AppDevEdgeRouter';
import QuestionsRepo from '../../repos/QuestionsRepo';
import PollsRepo from '../../repos/PollsRepo';
import constants from '../../utils/constants';
import type { APIQuestion } from '../APITypes';

class GetQuestionsRouter extends AppDevEdgeRouter<APIQuestion> {
  constructor () {
    super(constants.REQUEST_TYPES.GET);
  }

  getPath (): string {
    return '/polls/:id/questions/';
  }

  async contentArray (req, pageInfo, error) {
    const id = req.params.id;
    var questions;

    if (await PollsRepo.isAdmin(id, req.user)) {
      questions = await QuestionsRepo.getQuestionsFromPollId(id);
    } else {
      questions = await QuestionsRepo.getSharedQuestionsFromPollId(id);
    }

    return questions
      .filter(Boolean)
      .map(function (question) {
        return {
          node: {
            id: question.id,
            text: question.text,
            results: question.results
          },
          cursor: question.createdAt.valueOf()
        };
      });
  }
}

export default new GetQuestionsRouter().router;
