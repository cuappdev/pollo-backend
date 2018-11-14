// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';
import LogUtils from '../../../utils/LogUtils';
import GroupsRepo from '../../../repos/GroupsRepo';

class LeaveGroupRouter extends AppDevRouter<Object> {
    constructor() {
        super(constants.REQUEST_TYPES.DELETE);
    }

    getPath(): string {
        return '/groups/:id/members/';
    }

    async content(req: Request) {
        const groupId = req.params.id;
        const { user } = req;

        if (await GroupsRepo.isAdmin(groupId, user)) {
            throw LogUtils.logError('You are not allowed to leave your own group!');
        }

        await GroupsRepo.removeUserByGroupId(groupId, user, 'member');
        return null;
    }
}

export default new LeaveGroupRouter().router;
