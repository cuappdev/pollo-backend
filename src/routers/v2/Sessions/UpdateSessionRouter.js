// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import LogUtils from '../../../utils/LogUtils';
import SessionsRepo from '../../../repos/SessionsRepo';
import constants from '../../../utils/Constants';

import type { APISession } from '../APITypes';

class UpdateSessionRouter extends AppDevRouter<APISession> {
    constructor() {
        super(constants.REQUEST_TYPES.PUT);
    }

    getPath(): string {
        return '/sessions/:id/';
    }

    async content(req: Request): Promise<{ node: APISession }> {
        const { name } = req.body;
        const sessionId = req.params.id;
        const { user } = req;

        if (!name) throw LogUtils.logError('No fields specified to update.');

        let session = await SessionsRepo.getSessionById(sessionId);
        if (!session) {
            throw LogUtils.logError(`Session with id ${sessionId} was not found!`);
        }

        if (!await SessionsRepo.isAdmin(sessionId, user)) {
            throw LogUtils.logError('You are not authorized to update this session!');
        }

        session = await SessionsRepo.updateSessionById(sessionId, name);
        if (!session) {
            throw LogUtils.logError(`Session with id ${sessionId} was not found!`);
        }
        return {
            node: {
                id: session.id,
                name: session.name,
                code: session.code,
            },
        };
    }
}

export default new UpdateSessionRouter().router;
