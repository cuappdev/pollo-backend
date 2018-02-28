// @flow
import AppDevNodeRouter from '../../utils/AppDevNodeRouter';
import PollsRepo from '../../repos/PollsRepo';

import type { APIPoll } from '../APITypes';

class GetPollRouter extends AppDevNodeRouter<APIPoll> {
  getPath (): string {
    return '/polls/:id/';
  }

  async fetchWithId (id: number) {
    const poll = await PollsRepo.getPollById(id);
    return poll && {
      id: poll.id,
      name: poll.name,
      code: poll.code
    };
  }
}

export default new GetPollRouter().router;
