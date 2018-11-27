// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import constants from '../../utils/Constants';
import LogUtils from '../../utils/LogUtils';
import GroupsRepo from '../../repos/GroupsRepo';
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
            throw LogUtils.logError('Group id or code required.');
        }

        if (code) {
            id = await GroupsRepo.getGroupID(code);
            if (!id) {
                throw LogUtils.logError(`No group with code ${code} found.`);
            }
        }

        const group = await GroupsRepo.getGroupByID(id);
        if (!group) {
            throw LogUtils.logError(`No group with id ${id} found.`);
        }

        if (req.app.groupManager.findSocket(code, id) === undefined) {
            await req.app.groupManager.startNewGroup(group);
        }

        return {
            node: {
                id: group.id,
                name: group.name,
                code: group.code,
            },
        };
    }
}

export default new JoinGroupRouter().router;
