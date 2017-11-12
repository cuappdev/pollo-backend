// @flow
import type {
  SingleResponse,
  MultipleResponse,
  APIAnswer
} from 'clicker-types';

import AppDevEdgeRouter from '../../utils/AppDevEdgeRouter';
import constants from '../../utils/constants';
import ResponsesRepo from '../../repos/ResponsesRepo';

class GetResponsesRouter extends AppDevEdgeRouter<APIAnswer> {
  constructor () {
    super(constants.REQUEST_TYPES.GET);
  }

  getPath (): string {
    return '/questions/:id/answers/';
  }

  async contentArray (req, pageInfo, error) {
    const id = req.params.id;
    const responses = await ResponsesRepo
      .paginateResponseByQuestionId(id, pageInfo.cursor, pageInfo.count);

    var nodes = responses
      .filter(Boolean)
      .map(function (response) {
        var node;
        var userId = (response.user) ? response.user.id : null;
        if (response.type === constants.QUESTION_TYPES.FREE_RESPONSE ||
          response.type === constants.QUESTION_TYPES.MULTIPLE_CHOICE) {
          var r: SingleResponse = {
            id: String(response.id),
            question: id,
            answerer: String(userId),
            type: response.type,
            response: response.response.answer
          };
          node = r;
        } else {
          var m: MultipleResponse = {
            id: String(response.id),
            question: id,
            answerer: String(userId),
            type: response.type,
            response: response.response.answer
          };
          node = m;
        }
        return {
          node: node,
          cursor: response.createdAt.valueOf()
        };
      });

    return nodes;
  }
}

export default new GetResponsesRouter().router;
