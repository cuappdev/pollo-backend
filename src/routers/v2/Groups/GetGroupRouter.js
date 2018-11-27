// @flow
import AppDevNodeRouter from '../../../utils/AppDevNodeRouter';
import GroupsRepo from '../../../repos/GroupsRepo';

import type { APIGroup } from '../APITypes';

class GetGroupRouter extends AppDevNodeRouter<APIGroup> {
    getPath(): string {
        return '/sessions/:id/';
    }

    async fetchWithID(id: number) {
        const group = await GroupsRepo.getGroupByID(id);
        return group && {
            id: group.id,
            name: group.name,
            code: group.code,
        };
    }
}

export default new GetGroupRouter().router;
