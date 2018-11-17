// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import PollsRepo from '../../../repos/PollsRepo';
import constants from '../../../utils/Constants';
import LogUtils from '../../../utils/LogUtils';
import SessionsRepo from '../../../repos/SessionsRepo';

class DeletePollRouter extends AppDevRouter<Object> {
    constructor() {
        super(constants.REQUEST_TYPES.DELETE);
    }

    getPath(): string {
        return '/polls/:id/';
    }

    async content(req: Request) {
        const pollId = req.params.id;
        const { user } = req;

        const session = await PollsRepo.getSessionFromPollId(pollId);
        if (!session) {
            throw LogUtils.logError(`Couldn't find session with poll ${pollId}`);
        }
        if (!await SessionsRepo.isAdmin(session.id, user)) {
            throw LogUtils.logError('You are not authorized to delete this poll!');
        }
        await PollsRepo.deletePollById(pollId);
        return null;
    }
}

export default new DeletePollRouter().router;
