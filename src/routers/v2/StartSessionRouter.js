// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import constants from '../../utils/Constants';
import LogUtils from '../../utils/LogUtils';
import SessionsRepo from '../../repos/SessionsRepo';
import type { APISession } from './APITypes';

class StartSessionRouter extends AppDevRouter<APISession> {
    constructor() {
        super(constants.REQUEST_TYPES.POST);
    }

    getPath(): string {
        return '/start/session/';
    }

    async content(req: Request) {
        const { code } = req.body;
        let { name } = req.body;

        if (!name) name = '';

        if (!code) {
            throw LogUtils.logError('Code required.');
        }

        const session = await SessionsRepo.createSession(name, code, req.user);
        await req.app.sessionManager.startNewSession(session);

        return {
            node: {
                id: session.id,
                name: session.name,
                code: session.code,
            },
        };
    }
}

export default new StartSessionRouter().router;
