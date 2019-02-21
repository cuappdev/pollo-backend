// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import LogUtils from '../../../utils/LogUtils';
import GroupsRepo from '../../../repos/GroupsRepo';
import constants from '../../../utils/Constants';

import type { APIGroup } from '../APITypes';

class PostGroupRouter extends AppDevRouter<Object> {
    constructor() {
        super(constants.REQUEST_TYPES.POST);
    }

    getPath(): string {
        return '/sessions/';
    }

    async content(req: Request): Promise<{ node: APIGroup }> {
        let { name } = req.body;
        const { code } = req.body;
        const { user } = req;

        if (!name) name = '';
        if (!user) throw LogUtils.logErr({ message: 'User missing' });
        if (!code) throw LogUtils.logErr({ message: 'Code missing' });

        const group = await GroupsRepo.createGroup(name, code, user);

        return {
            node: {
                id: group.id,
                name: group.name,
                code: group.code,
            },
        };
    }
}

export default new PostGroupRouter().router;
