// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';
import GroupsRepo from '../../../repos/GroupsRepo';
import LogUtils from '../../../utils/LogUtils';
import PollsRepo from '../../../repos/PollsRepo';

import type { APIPoll } from '../APITypes';
import type { PollChoice } from '../../../utils/Constants';

class GetPollRouter extends AppDevRouter<APIPoll> {
  constructor() {
    super(constants.REQUEST_TYPES.GET);
  }

  getPath(): string {
    return '/polls/:id/';
  }

  async content(req: Request) {
    const { id } = req.params;
    const poll = await PollsRepo.getPollByID(id);
    if (!poll) throw LogUtils.logErr(`Poll with id ${id} cannot be found`);

    const group = await PollsRepo.getGroupFromPollID(poll.id);
    if (!group) throw LogUtils.logErr(`Group with id ${id} cannot be found`);

    const isAdmin = await GroupsRepo.isAdmin(group.id, req.user);

    if (!isAdmin && poll.type === constants.POLL_TYPES.MULTIPLE_CHOICE
      && poll.state !== constants.POLL_STATES.SHARED) {
      poll.answerChoices = poll.answerChoices.map((answer) => {
        delete answer.count;
        return answer;
      });
    }

    const userAnswer = poll.type === constants.POLL_TYPES.MULTIPLE_CHOICE
      ? poll.answers[req.user.googleID] : poll.upvotes[req.user.googleID];
    const answerObject: { string: PollChoice[]} = {};
    answerObject[req.user.googleID] = userAnswer || [];

    return {
      id: poll.id,
      answerChoices: poll.answerChoices,
      correctAnswer: poll.correctAnswer,
      createdAt: poll.createdAt,
      state: poll.state,
      text: poll.text,
      type: poll.type,
      updatedAt: poll.updatedAt,
      userAnswers: answerObject,
    };
  }
}

export default new GetPollRouter().router;
