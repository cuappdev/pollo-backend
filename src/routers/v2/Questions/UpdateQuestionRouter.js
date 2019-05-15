// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';
import LogUtils from '../../../utils/LogUtils';
import QuestionsRepo from '../../../repos/QuestionsRepo';

import type { APIQuestion } from '../APITypes';

class UpdateQuestionRouter extends AppDevRouter<APIQuestion> {
  constructor() {
    super(constants.REQUEST_TYPES.PUT);
  }

  getPath(): string {
    return '/questions/:id/';
  }

  async content(req: Request) {
    const questionID = req.params.id;
    const { text } = req.body;
    const { user } = req;

    if (!text) throw LogUtils.logErr('No fields specified to update');

    const group = await QuestionsRepo.getGroupFromQuestionID(questionID);
    if (!group) throw LogUtils.logErr(`Question with UUID ${questionID} has no group`);

    if (!await QuestionsRepo.isOwnerByID(questionID, user)) {
      throw LogUtils.logErr('You are not authorized to update this question', {}, { questionID, user });
    }
    const question = await QuestionsRepo.updateQuestionByID(questionID, text);
    if (!question) {
      throw LogUtils.logErr(`Question with UUID ${questionID} was not found`);
    }

    return question.serialize();
  }
}

export default new UpdateQuestionRouter().router;
