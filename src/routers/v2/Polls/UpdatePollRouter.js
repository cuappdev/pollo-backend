// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';
import GroupsRepo from '../../../repos/GroupsRepo';
import LogUtils from '../../../utils/LogUtils';
import PollsRepo from '../../../repos/PollsRepo';

import type { APIPoll } from '../APITypes';

class UpdatePollRouter extends AppDevRouter<APIPoll> {
  constructor() {
    super(constants.REQUEST_TYPES.PUT);
  }

  getPath(): string {
    return '/polls/:id/';
  }

  async content(req: Request) {
    const pollID = req.params.id;
    const {
      text, answerChoices, state, answers,
    } = req.body;
    const { user } = req;

    if (!answerChoices && !text && !state && !answers) {
      throw LogUtils.logErr('No fields specified to update');
    }

    const group = await PollsRepo.getGroupFromPollID(pollID);
    if (!group) throw LogUtils.logErr(`Poll with UUID ${pollID} has no group`);

    if (!await GroupsRepo.isAdmin(group.uuid, user)) {
      throw LogUtils.logErr(
        'You are not authorized to update this poll', {}, { pollID, user },
      );
    }

    const poll = await PollsRepo.updatePollByID(pollID, text,
      answerChoices, answers, state);
    if (!poll) {
      throw LogUtils.logErr(`Poll with UUID ${pollID} was not found`);
    }

    const userAnswer = poll.answers[req.user.googleID];
    const answerObject: { string: number[]} = {};
    answerObject[req.user.googleID] = userAnswer || [];

    return {
      ...poll.serialize(),
      userAnswers: answerObject,
    };
  }
}

export default new UpdatePollRouter().router;
