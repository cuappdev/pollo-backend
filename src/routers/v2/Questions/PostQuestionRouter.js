// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';
import GroupsRepo from '../../../repos/GroupsRepo';
import LogUtils from '../../../utils/LogUtils';
import QuestionsRepo from '../../../repos/QuestionsRepo';

import type { APIQuestion } from '../APITypes';

class PostQuestionRouter extends AppDevRouter<APIQuestion> {
  constructor() {
    super(constants.REQUEST_TYPES.POST);
  }

  getPath(): string {
    return '/sessions/:id/questions/';
  }

  async content(req: Request) {
    const groupID = req.params.id;
    const { text } = req.body;
    const { user } = req;

    if (!text) throw LogUtils.logErr('Cannot post empty question');

    const group = await GroupsRepo.getGroupByID(groupID);
    if (!group) throw LogUtils.logErr(`Couldn't find group with id ${groupID}`);

    if (!await GroupsRepo.isMember(groupID, user)) {
      throw LogUtils.logErr('You are not authorized to post a poll', {}, { groupID, user });
    }

    const question = await QuestionsRepo.createQuestion(text, group, user);

    return question.serialize();
  }
}

export default new PostQuestionRouter().router;
