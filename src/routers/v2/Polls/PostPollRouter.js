// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';
import GroupsRepo from '../../../repos/GroupsRepo';
import LogUtils from '../../../utils/LogUtils';
import PollsRepo from '../../../repos/PollsRepo';

import type { APIPoll } from '../APITypes';

class PostPollRouter extends AppDevRouter<APIPoll> {
  constructor() {
    super(constants.REQUEST_TYPES.POST);
  }

  getPath(): string {
    return '/sessions/:id/polls/';
  }

  async content(req: Request) {
    const groupID = req.params.id;
    let { text, results, shared } = req.body;
    const { type, correctAnswer } = req.body;
    const { user } = req;

    if (!text) text = '';
    if (!results) results = {};
    if (shared === null) shared = false;
    if (type !== 'FREE_RESPONSE' && type !== 'MULTIPLE_CHOICE') {
      throw LogUtils.logErr('Valid poll type not found', {}, { type });
    }

    const group = await GroupsRepo.getGroupByID(groupID);
    if (!group) throw LogUtils.logErr(`Couldn't find group with id ${groupID}`);

    if (!await GroupsRepo.isAdmin(groupID, user)) {
      throw LogUtils.logErr('You are not authorized to post a poll', {}, { groupID, user });
    }

    const poll = await PollsRepo
      .createPoll(text, group, results, shared, type, correctAnswer);

    return {
      id: poll.id,
      text: poll.text,
      results: poll.results,
      shared: poll.shared,
      type: poll.type,
      answer: null,
      correctAnswer: poll.correctAnswer,
    };
  }
}

export default new PostPollRouter().router;
