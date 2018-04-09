// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import PollsRepo from '../../repos/PollsRepo';
import SessionsRepo from '../../repos/SessionsRepo';
import constants from '../../utils/constants';

import type { APIPoll } from '../APITypes';

class PostDraftRouter extends AppDevRouter<Object> {
  constructor () {
    super(constants.REQUEST_TYPES.POST);
  }

  getPath (): string {
    return '/poll/';
  }

  async content (req: Request): Promise<{ node: APIPoll }> {
    var text = req.body.text;
    var user = req.user;

    if (!text) text = '';

    const poll =
      await PollsRepo.createDraft(text);

    return {
      node: {
        id: poll.id,
        text: poll.text,
        results: poll.results
      }
    };
  }
}

export default new PostDraftRouter().router;
