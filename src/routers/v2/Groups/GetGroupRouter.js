// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';
import GroupsRepo from '../../../repos/GroupsRepo';
import LogUtils from '../../../utils/LogUtils';

import type { APIGroup } from '../APITypes';

class GetGroupRouter extends AppDevRouter<APIGroup> {
    constructor() {
        super(constants.REQUEST_TYPES.GET);
    }

    getPath(): string {
        return '/sessions/:id/';
    }

    async content(req: Request) {
        const group = await GroupsRepo.getGroupByID(req.params.id);
        if (!group) throw LogUtils.logErr(`Group with id ${req.params.id} not found!`);

        return {
            id: group.id,
            name: group.name,
            code: group.code,
        };
    }
}

export default new GetGroupRouter().router;
