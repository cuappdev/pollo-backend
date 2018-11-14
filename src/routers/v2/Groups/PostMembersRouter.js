// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import LogUtils from '../../../utils/LogUtils';
import GroupsRepo from '../../../repos/GroupsRepo';
import constants from '../../../utils/Constants';

class PostMembersRouter extends AppDevRouter<Object> {
    constructor() {
        super(constants.REQUEST_TYPES.POST);
    }

    getPath(): string {
        return '/groups/:id/members/';
    }

    async content(req: Request) {
        const { id } = req.params;
        const { user } = req;
        const { memberIDs } = req.body;

        if (!memberIDs) throw LogUtils.logError('List of member ids missing!');

        if (!await GroupsRepo.isAdmin(id, user)) {
            throw LogUtils.logError('You are not authorized to add members to this group!');
        }
        await GroupsRepo.addUsersByIDs(id, memberIDs, 'member');
        return null;
    }
}

export default new PostMembersRouter().router;
