// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import LogUtils from '../../../utils/LogUtils';
import SessionsRepo from '../../../repos/SessionsRepo';
import constants from '../../../utils/Constants';

class DeleteSessionRouter extends AppDevRouter<Object> {
    constructor() {
        super(constants.REQUEST_TYPES.DELETE);
    }

    getPath(): string {
        return '/sessions/:id/';
    }

    async content(req: Request) {
        const sessionId = req.params.id;
        const { user } = req;

        const session = await SessionsRepo.getSessionById(sessionId);
        if (!session) throw LogUtils.logError(`Session with id ${sessionId} not found!`);

        if (!await SessionsRepo.isAdmin(sessionId, user)) {
            throw LogUtils.logError('You are not authorized to delete this session!');
        }

        await SessionsRepo.deleteSessionById(sessionId);
        return null;
    }
}

export default new DeleteSessionRouter().router;
