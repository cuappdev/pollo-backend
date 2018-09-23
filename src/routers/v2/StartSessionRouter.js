// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import constants from '../../utils/constants';
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
        const { id, code, create } = req.body;
        let { name } = req.body;

        if (!name) name = '';

        if (!(id || code)) {
            throw new Error('Session id, or code required.');
        }

        let session;

        if (id && !create) {
            session = await SessionsRepo.getSessionById(id);
        }

        if (code && !create) {
            const sessionId = await SessionsRepo.getSessionId(code);

            if (sessionId) {
                session = await SessionsRepo.getSessionById(sessionId);
            }
        }

        if (!session) {
            if (create) {
                session = await SessionsRepo.createSession(name, code, req.user);
            } else if (id) {
                throw new Error(`No session with id ${id} found.`);
            } else {
                throw new Error(`No session with code ${code} found.`);
            }
        }

        if (!req.app.sessionManager.isLive(code, id)) {
            await req.app.sessionManager.startNewSession(session);
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

export default new StartSessionRouter().router;
