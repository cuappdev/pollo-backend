// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';
import GroupsRepo from '../../../repos/GroupsRepo';

import type { APIUser } from '../APITypes';

class GetAdminsRouter extends AppDevRouter<APIUser[]> {
    constructor() {
        super(constants.REQUEST_TYPES.GET);
    }

    getPath(): string {
        return '/sessions/:id/admins/';
    }

    async content(req: Request) {
        const { id } = req.params;
        const users = await GroupsRepo.getUsersByGroupID(id, 'admin');
        return users
            .filter(Boolean)
            .map(user => ({
                id: user.id,
                name: `${user.firstName} ${user.lastName}`,
                netID: user.netID,
            }));
    }
}

export default new GetAdminsRouter().router;
