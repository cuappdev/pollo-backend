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
        return '/sessions/:id/admins/';
    }

    async content(req: Request) {
        const { id } = req.params;
        const { user } = req;
        const { adminIDs } = req.body;

        if (!adminIDs) throw LogUtils.logErr('List of admin ids missing');

        if (!await GroupsRepo.isAdmin(id, user)) {
            throw LogUtils.logErr(
                'You are not authorized to add admins to this group', {}, { id, user },
            );
        }

        await GroupsRepo.addUsersByIDs(id, adminIDs, 'admin');
        return null;
    }
}

export default new PostAdminsRouter().router;
