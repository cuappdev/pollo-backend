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
        const pollID = req.params.id;
        const { user } = req;

        const group = await PollsRepo.getGroupFromPollID(pollID);
        if (!group) {
            throw LogUtils.logErr({ message: `Couldn't find group with poll ${pollID}` });
        }
        if (!await GroupsRepo.isAdmin(group.id, user)) {
            throw LogUtils.logErr(
                {}, { pollID, user }, 'You are not authorized to delete this poll',
            );
        }
        await PollsRepo.deletePollByID(pollID);
        return null;
    }
}

export default new DeletePollRouter().router;
