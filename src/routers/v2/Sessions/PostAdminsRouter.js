// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import SessionsRepo from '../../../repos/SessionsRepo';
import constants from '../../../utils/constants';

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
        const { adminIds } = req.body;

        if (!adminIds) throw new Error('List of admin ids missing!');

        if (!await SessionsRepo.isAdmin(id, user)) {
            throw new Error('You are not authorized to add admins to this session!');
        }

        await SessionsRepo.addUsersByIds(id, adminIds, 'admin');
        return null;
    }
}

export default new PostAdminsRouter().router;
