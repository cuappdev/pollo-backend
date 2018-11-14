// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import PollsRepo from '../../../repos/PollsRepo';
import constants from '../../../utils/Constants';
import LogUtils from '../../../utils/LogUtils';
import GroupsRepo from '../../../repos/GroupsRepo';

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

        const group = await PollsRepo.getGroupFromPollId(pollId);
        if (!group) {
            throw LogUtils.logError(`Couldn't find group with poll ${pollId}`);
        }
        if (!await GroupsRepo.isAdmin(group.id, user)) {
            throw LogUtils.logError('You are not authorized to delete this poll!');
        }
        await PollsRepo.deletePollById(pollId);
        return null;
    }
}

export default new DeletePollRouter().router;
