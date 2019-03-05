// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';
import GroupsRepo from '../../../repos/GroupsRepo';
import LogUtils from '../../../utils/LogUtils';

import type { NoResponse } from '../../../utils/AppDevRouter';

class PostMembersRouter extends AppDevRouter<NoResponse> {
    constructor() {
        super(constants.REQUEST_TYPES.POST);
    }

    getPath(): string {
        return '/sessions/:id/members/';
    }

    async content(req: Request) {
        const { id } = req.params;
        const { user } = req;
        const { memberIDs } = req.body;

        if (!memberIDs) throw LogUtils.logErr('List of member ids missing');

        if (!await GroupsRepo.isAdmin(id, user)) {
            throw LogUtils.logErr(
                'You are not authorized to add members to this group', {}, { id, user },
            );
        }
        await GroupsRepo.addUsersByIDs(id, memberIDs, 'member');
        return null;
    }
}

export default new PostMembersRouter().router;
