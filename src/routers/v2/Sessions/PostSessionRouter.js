// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import SessionsRepo from '../../../repos/SessionsRepo';
import constants from '../../../utils/Constants';

import type { APISession } from '../APITypes';

class PostSessionRouter extends AppDevRouter<Object> {
    constructor() {
        super(constants.REQUEST_TYPES.POST);
    }

    getPath(): string {
        return '/sessions/';
    }

    async content(req: Request): Promise<{ node: APISession }> {
        let { name } = req.body;
        const { code } = req.body;
        const { user } = req;

        if (!name) name = '';
        if (!user) throw new Error('User missing');
        if (!code) throw new Error('Code missing');

        const session = await SessionsRepo.createSession(name, code, user);

        return {
            node: {
                id: session.id,
                name: session.name,
                code: session.code,
            },
        };
    }
}

export default new PostSessionRouter().router;
