// @flow
import AppDevNodeRouter from '../../../utils/AppDevNodeRouter';
import GroupsRepo from '../../../repos/GroupsRepo';

import type { APIPoll } from '../APITypes';

class GetPollRouter extends AppDevNodeRouter<APIPoll> {
    middleware() {
        return [];
    }

    getPath(): string {
        return '/polls/:id/';
    }

    async fetchWithID(id: number) {
        const poll = await GroupsRepo.getGroupByID(id);
        return poll && {
            id: poll.id,
            name: poll.name,
            code: poll.code,
        };
    }
}

export default new GetPollRouter().router;
