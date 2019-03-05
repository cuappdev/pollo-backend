// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';
import GroupsRepo from '../../../repos/GroupsRepo';
import LogUtils from '../../../utils/LogUtils';
import PollsRepo from '../../../repos/PollsRepo';

import type { NoResponse } from '../../../utils/AppDevRouter';

class DeletePollRouter extends AppDevRouter<NoResponse> {
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
            throw LogUtils.logErr(`Couldn't find group with poll ${pollID}`);
        }
        if (!await GroupsRepo.isAdmin(group.id, user)) {
            throw LogUtils.logErr(
                'You are not authorized to delete this poll', {}, { pollID, user },
            );
        }
        await PollsRepo.deletePollByID(pollID);
        return null;
    }
}

export default new DeletePollRouter().router;
