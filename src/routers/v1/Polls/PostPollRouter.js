// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import GroupsRepo from '../../../repos/GroupsRepo';
import UsersRepo from '../../../repos/UsersRepo';
import constants from '../../../utils/Constants';

import type { APIPoll } from '../APITypes';

class PostPollRouter extends AppDevRouter<Object> {
    constructor() {
        super(constants.REQUEST_TYPES.POST);
    }

    middleware() {
        return (req, res, next) => next();
    }

    getPath(): string {
        return '/polls/';
    }

    async content(req: Request): Promise<{ node: APIPoll }> {
        let { name } = req.body;
        const { code, deviceID } = req.body;

        if (!name) name = '';
        if (!code) throw new Error('Code missing');
        if (!deviceID) throw new Error('Device id missing');

        let user = await UsersRepo.getUserByGoogleID(deviceID);
        if (!user) {
            user = await UsersRepo.createDummyUser(deviceID);
        }

        const poll = await GroupsRepo.createGroup(name, code, user);

        return {
            node: {
                id: poll.id,
                name: poll.name,
                code: poll.code,
            },
        };
    }
}

export default new PostPollRouter().router;
