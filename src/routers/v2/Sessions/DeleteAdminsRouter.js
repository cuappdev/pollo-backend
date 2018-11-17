// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import LogUtils from '../../../utils/LogUtils';
import constants from '../../../utils/Constants';
import SessionsRepo from '../../../repos/SessionsRepo';

class DeleteAdminsRouter extends AppDevRouter<Object> {
    constructor() {
        super(constants.REQUEST_TYPES.PUT);
    }

    getPath(): string {
        return '/sessions/:id/admins/';
    }

    async content(req: Request) {
        const sessionId = req.params.id;
        const { user } = req;
        const adminIds = JSON.parse(req.body.adminIds);

        if (!adminIds) throw LogUtils.logError('List of admin ids missing!');

        if (!await SessionsRepo.isAdmin(sessionId, user)) {
            throw LogUtils.logError('You are not authorized to remove admins from this session!');
        }

        await SessionsRepo.removeUserBySessionId(sessionId, adminIds, 'admin');
        return null;
    }
}

export default new DeleteAdminsRouter().router;
