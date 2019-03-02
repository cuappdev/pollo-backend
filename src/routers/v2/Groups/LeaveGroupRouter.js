// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';
import GroupsRepo from '../../../repos/GroupsRepo';
import LogUtils from '../../../utils/LogUtils';

import type { NoResponse } from '../../../utils/AppDevRouter';

class LeaveGroupRouter extends AppDevRouter<NoResponse> {
    constructor() {
        super(constants.REQUEST_TYPES.DELETE);
    }

    getPath(): string {
        return '/sessions/:id/members/';
    }

    async content(req: Request) {
        const groupID = req.params.id;
        const { user } = req;

        if (await GroupsRepo.isAdmin(groupID, user)) {
            throw LogUtils.logErr('You are not allowed to leave your own group', {}, { groupID });
        }

        await GroupsRepo.removeUserByGroupID(groupID, user, 'member');
        return null;
    }
}

export default new LeaveGroupRouter().router;
