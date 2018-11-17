// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import LogUtils from '../../../utils/LogUtils';
import GroupsRepo from '../../../repos/GroupsRepo';
import constants from '../../../utils/Constants';

import type { APIGroup } from '../APITypes';

class UpdateGroupRouter extends AppDevRouter<APIGroup> {
    constructor() {
        super(constants.REQUEST_TYPES.PUT);
    }

    getPath(): string {
        return '/sessions/:id/';
    }

    async content(req: Request): Promise<{ node: APIGroup }> {
        const { name } = req.body;
        const groupID = req.params.id;
        const { user } = req;

        if (!name) throw LogUtils.logError('No fields specified to update.');

        let group = await GroupsRepo.getGroupByID(groupID);
        if (!group) {
            throw LogUtils.logError(`Group with id ${groupID} was not found!`);
        }

        if (!await GroupsRepo.isAdmin(groupID, user)) {
            throw LogUtils.logError('You are not authorized to update this group!');
        }

        group = await GroupsRepo.updateGroupByID(groupID, name);
        if (!group) {
            throw LogUtils.logError(`Group with id ${groupID} was not found!`);
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

export default new UpdateGroupRouter().router;
