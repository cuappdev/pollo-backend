// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import LogUtils from '../../../utils/LogUtils';
import GroupsRepo from '../../../repos/GroupsRepo';
import constants from '../../../utils/Constants';

class PostAdminsRouter extends AppDevRouter<Object> {
    constructor() {
        super(constants.REQUEST_TYPES.POST);
    }

    getPath(): string {
        return '/groups/:id/admins/';
    }

    async content(req: Request) {
        const { id } = req.params;
        const { user } = req;
        const { adminIDs } = req.body;

        if (!adminIDs) throw LogUtils.logError('List of admin ids missing!');

        if (!await GroupsRepo.isAdmin(id, user)) {
            throw LogUtils.logError('You are not authorized to add admins to this group!');
        }

        await GroupsRepo.addUsersByIDs(id, adminIDs, 'admin');
        return null;
    }
}

export default new PostAdminsRouter().router;
