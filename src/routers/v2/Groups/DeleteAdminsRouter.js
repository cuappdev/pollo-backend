// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import LogUtils from '../../../utils/LogUtils';
import constants from '../../../utils/Constants';
import GroupsRepo from '../../../repos/GroupsRepo';

class DeleteAdminsRouter extends AppDevRouter<Object> {
    constructor() {
        super(constants.REQUEST_TYPES.PUT);
    }

    getPath(): string {
        return '/sessions/:id/admins/';
    }

    async content(req: Request) {
        const groupID = req.params.id;
        const { user } = req;
        const adminIDs = JSON.parse(req.body.adminIDs);

        if (!adminIDs) throw LogUtils.logError('List of admin ids missing!');

        if (!await GroupsRepo.isAdmin(groupID, user)) {
            throw LogUtils.logError('You are not authorized to remove admins from this group!');
        }

        await GroupsRepo.removeUserByGroupID(groupID, adminIDs, 'admin');
        return null;
    }
}

export default new DeleteAdminsRouter().router;
