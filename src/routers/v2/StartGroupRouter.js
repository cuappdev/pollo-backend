// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import constants from '../../utils/Constants';
import LogUtils from '../../utils/LogUtils';
import GroupsRepo from '../../repos/GroupsRepo';
import type { APIGroup } from './APITypes';

class StartGroupRouter extends AppDevRouter<APIGroup> {
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
            throw LogUtils.logErr('Code required');
        }

        const group = await GroupsRepo.createGroup(name, code, req.user);
        await req.app.groupManager.startNewGroup(group);

        return {
            node: {
                id: group.id,
                name: group.name,
                code: group.code,
            },
        };
    }
}

export default new StartGroupRouter().router;
