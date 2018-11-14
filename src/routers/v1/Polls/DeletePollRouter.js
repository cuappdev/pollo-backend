// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import GroupsRepo from '../../../repos/GroupsRepo';
import constants from '../../../utils/Constants';

class DeletePollRouter extends AppDevRouter<Object> {
    constructor() {
        super(constants.REQUEST_TYPES.DELETE, false);
    }

    getPath(): string {
        return '/polls/:id/:deviceId/';
    }

    async content(req: Request) {
        const { id, deviceId } = req.params;

        const poll = await GroupsRepo.getGroupId(id);
        if (!poll) throw new Error(`Poll with id ${id} not found!`);

        const users = await GroupsRepo.getUsersByGroupId(id, 'admin');
        if (users && users[0] && deviceId !== users[0].googleId) {
            throw new Error('You are not authorized to delete this poll!');
        }

        await GroupsRepo.deleteGroupById(id);
        return null;
    }
}

export default new DeletePollRouter().router;
