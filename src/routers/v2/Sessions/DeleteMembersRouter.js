// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import LogUtils from '../../../utils/LogUtils';
import constants from '../../../utils/Constants';
import SessionsRepo from '../../../repos/SessionsRepo';

class DeleteMembersRouter extends AppDevRouter<Object> {
    constructor() {
        super(constants.REQUEST_TYPES.PUT);
    }

    getPath(): string {
        return '/sessions/:id/members/';
    }

    async content(req: Request) {
        const sessionId = req.params.id;
        const { user } = req;
        const memberIds = JSON.parse(req.body.memberIds);

        if (!memberIds) throw LogUtils.logError('List of member ids missing!');

        if (!await SessionsRepo.isAdmin(sessionId, user)) {
            throw LogUtils.logError('You are not authorized to remove members from this session!');
        }

        await SessionsRepo.removeUserBySessionId(sessionId, memberIds, 'member');
        return null;
    }
}

export default new DeleteMembersRouter().router;
