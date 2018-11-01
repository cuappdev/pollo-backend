// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import constants from '../../utils/Constants';
import SessionsRepo from '../../repos/SessionsRepo';
import type { APISession } from './APITypes';

class JoinSessionRouter extends AppDevRouter<APISession> {
    constructor() {
        super(constants.REQUEST_TYPES.POST);
    }

    getPath(): string {
        return '/join/session/';
    }

    async content(req: Request) {
        const { code } = req.body;
        let { id } = req.body;

        if (!id && !code) {
            throw new Error('Session id or code required.');
        }

        if (code) {
            id = await SessionsRepo.getSessionId(code);
            if (!id) {
                throw new Error(`No session with code ${code} found.`);
            }
        }

        const session = await SessionsRepo.getSessionById(id);
        if (!session) {
            throw new Error(`No session with id ${id} found.`);
        }

        if (req.app.sessionManager.findSocket(code, id) === undefined) {
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

export default new JoinSessionRouter().router;
