// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import LogUtils from '../../../utils/LogUtils';
import GroupsRepo from '../../../repos/GroupsRepo';
import constants from '../../../utils/Constants';

class DeleteGroupRouter extends AppDevRouter<Object> {
    constructor() {
        super(constants.REQUEST_TYPES.DELETE);
    }

    getPath(): string {
        return '/sessions/:id/';
    }

    async content(req: Request) {
        const groupID = req.params.id;
        const { user } = req;

        const group = await GroupsRepo.getGroupByID(groupID);
        if (!group) throw LogUtils.logErr({ message: `Group with id ${groupID} not found!` });

        if (!await GroupsRepo.isAdmin(groupID, user)) {
            throw LogUtils.logErr(
                {}, { groupID, user }, 'You are not authorized to delete this group!',
            );
        }

        await GroupsRepo.deleteGroupByID(groupID);
        return null;
    }
}

export default new DeleteGroupRouter().router;
