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
    if (!poll) throw LogUtils.logErr(`Poll with UUID ${id} cannot be found`);

    const group = await PollsRepo.getGroupFromPollID(poll.uuid);
    if (!group) throw LogUtils.logErr(`Group with UUID ${id} cannot be found`);

    const isAdmin = await GroupsRepo.isAdmin(group.uuid, req.user);

    if (!isAdmin && poll.state !== constants.POLL_STATES.SHARED) {
      poll.answerChoices = poll.answerChoices.map((answer) => {
        delete answer.count;
        return answer;
      });
    }

    const userAnswer = poll.answers[req.user.googleID];
    const answerObject: { string: PollChoice[]} = {};
    answerObject[req.user.googleID] = userAnswer || [];

    return {
      ...poll.serialize(),
      userAnswers: answerObject,
    };
  }
}

export default new GetPollRouter().router;
