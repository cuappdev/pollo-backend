// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import SessionsRepo from '../../../repos/SessionsRepo';
import constants from '../../../utils/constants';

class DeletePollRouter extends AppDevRouter<Object> {
    constructor() {
        super(constants.REQUEST_TYPES.DELETE, false);
    }

    getPath(): string {
        return '/polls/:id/:deviceId/';
    }

    async content(req: Request) {
        const { id, deviceId } = req.params;

        const poll = await SessionsRepo.getSessionId(id);
        if (!poll) throw new Error(`Poll with id ${id} not found!`);

        const users = await SessionsRepo.getUsersBySessionId(id, 'admin');
        if (users && users[0] && deviceId !== users[0].googleId) {
            throw new Error('You are not authorized to delete this poll!');
        }

        await SessionsRepo.deleteSessionById(id);
        return null;
    }
}

export default new DeletePollRouter().router;
