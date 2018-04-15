// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import PollsRepo from '../../repos/PollsRepo';
import GroupsRepo from '../../repos/GroupsRepo';
import constants from '../../utils/constants';

import type { APIPoll } from '../APITypes';

class PostPollToGroupRouter extends AppDevRouter<Object> {
  constructor () {
    super(constants.REQUEST_TYPES.POST);
  }

  getPath (): string {
    return '/groups/:id/polls/';
  }

  async content (req: Request): Promise<{ node: APIPoll }> {
    const groupId = req.params.id;
    var text = req.body.text;
    var results = req.body.results;
    var shared = req.body.shared;
    var user = req.user;

    if (!text) text = '';
    if (!results) results = {};
    if (shared === null) shared = false;

    const group = await GroupsRepo.getGroupById(groupId);
    if (!group) throw new Error(`Couldn't find group with id ${groupId}`);

    if (!await GroupsRepo.isAdmin(groupId, user)) {
      throw new Error('You are not authorized to post a poll!');
    }

    const poll =
      await PollsRepo.createPoll(text, null, results, shared, group);

    return {
      node: {
        id: poll.id,
        text: poll.text,
        results: poll.results
      }
    };
  }
}

export default new PostPollToGroupRouter().router;
