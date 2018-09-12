// @flow
import AppDevNodeRouter from '../../../utils/AppDevNodeRouter';
import SessionsRepo from '../../../repos/SessionsRepo';

import type { APIPoll } from '../APITypes';

class GetPollRouter extends AppDevNodeRouter<APIPoll> {
    constructor() {
        super(false);
    }

    getPath(): string {
        return '/polls/:id/';
    }

    async fetchWithId(id: number) {
        const poll = await SessionsRepo.getSessionById(id);
        return poll && {
            id: poll.id,
            name: poll.name,
            code: poll.code,
        };
    }
}

export default new GetPollRouter().router;
