// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import LogUtils from '../../../utils/LogUtils';
import constants from '../../../utils/Constants';
import GroupsRepo from '../../../repos/GroupsRepo';

class DeleteMembersRouter extends AppDevRouter<Object> {
    constructor() {
        super(constants.REQUEST_TYPES.PUT);
    }

    getPath(): string {
        return '/groups/:id/members/';
    }

    async content(req: Request) {
        const groupId = req.params.id;
        const { user } = req;
        const memberIds = JSON.parse(req.body.memberIds);

        if (!memberIds) throw LogUtils.logError('List of member ids missing!');

        if (!await GroupsRepo.isAdmin(groupId, user)) {
            throw LogUtils.logError('You are not authorized to remove members from this group!');
        }

        await GroupsRepo.removeUserByGroupId(groupId, memberIds, 'member');
        return null;
    }
}

export default new DeleteMembersRouter().router;
