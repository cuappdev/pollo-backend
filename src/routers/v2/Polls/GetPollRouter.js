// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';
import GroupsRepo from '../../../repos/GroupsRepo';
import LogUtils from '../../../utils/LogUtils';
import PollsRepo from '../../../repos/PollsRepo';

import type { APIPoll } from '../APITypes';

class GetPollRouter extends AppDevRouter<APIPoll> {
    constructor() {
        super(constants.REQUEST_TYPES.GET);
    }

    getPath(): string {
        return '/polls/:id/';
    }

    async content(req: Request) {
        const { id } = req.params;
        const poll = await PollsRepo.getPollByID(id);
        if (!poll) throw LogUtils.logErr(`Poll with id ${id} cannot be found`);

        const group = await PollsRepo.getGroupFromPollID(poll.id);
        if (!group) throw LogUtils.logErr(`Group with id ${id} cannot be found`);

        const isAdmin = await GroupsRepo.isAdmin(group.id, req.user);

        return poll && {
            id: poll.id,
            text: poll.text,
            results: poll.results,
            shared: poll.shared,
            type: poll.type,
            answer: isAdmin ? null : poll.userAnswers[req.user.googleID],
            correctAnswer: poll.correctAnswer,
        };
    }
}

export default new GetPollRouter().router;
