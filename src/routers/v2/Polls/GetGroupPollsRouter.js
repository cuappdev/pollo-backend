// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';
import GroupsRepo from '../../../repos/GroupsRepo';
import LogUtils from '../../../utils/LogUtils';

class GetGroupPollsRouter extends AppDevRouter<Object[]> {
  constructor() {
    super(constants.REQUEST_TYPES.GET);
  }

  getPath(): string {
    return '/sessions/:id/polls/';
  }

  async content(req: Request) {
    const { id } = req.params;
    const isAdmin = await GroupsRepo.isAdmin(id, req.user);
    const polls = await GroupsRepo.getPolls(id, !isAdmin);
    if (!polls) throw LogUtils.logErr(`Problem getting polls from group UUID: ${id}`);

    // List of all dates
    const datesArray = [];
    // Date mapped to list of polls
    const pollsByDate = [];

    polls.filter(Boolean).forEach((poll) => {
      // date is in Unix time in seconds
      const date = poll.createdAt;
      const userAnswer = poll.type === constants.POLL_TYPES.MULTIPLE_CHOICE
        ? poll.answers[req.user.googleID] : poll.upvotes[req.user.googleID];
      const answerObject = {};
      answerObject[req.user.googleID] = userAnswer || [];

      const p = {
        ...poll.serialize(),
        userAnswers: answerObject,
      };
      const ind = datesArray.indexOf(date);
      if (ind === -1) { // date not found
        datesArray.push(date);
        pollsByDate.push({ date, polls: [p] });
      } else { // date found
        pollsByDate[ind].polls.push(p);
      }
    });
    return pollsByDate;
  }
}

export default new GetGroupPollsRouter().router;
