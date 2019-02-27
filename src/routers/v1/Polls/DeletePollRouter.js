// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import GroupsRepo from '../../../repos/GroupsRepo';
import constants from '../../../utils/Constants';

class DeletePollRouter extends AppDevRouter<Object> {
    constructor() {
        super(constants.REQUEST_TYPES.DELETE);
    }

    middleware() {
        return (req, res, next) => next();
    }

    getPath(): string {
        return '/polls/:id/:deviceID/';
    }

    async content(req: Request) {
        const { id, deviceID } = req.params;

        const poll = await GroupsRepo.getGroupID(id);
        if (!poll) throw new Error(`Poll with id ${id} not found!`);

        const users = await GroupsRepo.getUsersByGroupID(id, 'admin');
        if (users && users[0] && deviceID !== users[0].googleID) {
            throw new Error('You are not authorized to delete this poll!');
        }

        await GroupsRepo.deleteGroupByID(id);
        return null;
    }
}

export default new DeletePollRouter().router;
