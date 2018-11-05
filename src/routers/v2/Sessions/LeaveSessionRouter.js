// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';
import LogUtils from '../../../utils/LogUtils';
import SessionsRepo from '../../../repos/SessionsRepo';

class LeaveSessionRouter extends AppDevRouter<Object> {
    constructor() {
        super(constants.REQUEST_TYPES.DELETE);
    }

    getPath(): string {
        return '/sessions/:id/members/';
    }

    async content(req: Request) {
        const sessionId = req.params.id;
        const { user } = req;

        if (await SessionsRepo.isAdmin(sessionId, user)) {
            throw LogUtils.logError('You are not allowed to leave your own session!');
        }

        await SessionsRepo.removeUserBySessionId(sessionId, user, 'member');
        return null;
    }
}

export default new LeaveSessionRouter().router;
