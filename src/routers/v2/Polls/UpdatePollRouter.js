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
    const { text, results, shared } = req.body;
    const { user } = req;

    if (!results && !text && shared === null) {
      throw LogUtils.logErr('No fields specified to update');
    }

    const group = await PollsRepo.getGroupFromPollID(pollID);
    if (!group) throw LogUtils.logErr(`Poll with id ${pollID} has no group`);

    if (!await GroupsRepo.isAdmin(group.id, user)) {
      throw LogUtils.logErr(
        'You are not authorized to update this poll', {}, { pollID, user },
      );
    }
    const poll = await PollsRepo.updatePollByID(pollID, text,
      results, shared);
    if (!poll) {
      throw LogUtils.logErr(`Poll with id ${pollID} was not found`);
    }

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

export default new UpdatePollRouter().router;
