// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import constants from '../../utils/Constants';
import GroupsRepo from '../../repos/GroupsRepo';
import LogUtils from '../../utils/LogUtils';

import type { APIGroup } from './APITypes';

class JoinGroupRouter extends AppDevRouter<APIGroup> {
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
            throw LogUtils.logErr('Group id or code required');
        }

        if (code) {
            id = await GroupsRepo.getGroupID(code);
            if (!id) {
                throw LogUtils.logErr(`No group with code ${code} found`);
            }
        }

        const group = await GroupsRepo.getGroupByID(id);
        if (!group) {
            throw LogUtils.logErr(`No group with id ${id} found`);
        }

        if (req.app.groupManager.findSocket(code, id) === undefined) {
            await req.app.groupManager.startNewGroup(group);
        }

        return {
            id: group.id,
            code: group.code,
            isLive: await req.app.groupManager.isLive(group.code),
            name: group.name,
            updatedAt: group.updatedAt,
        };
    }
}

export default new JoinGroupRouter().router;
