// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import LogUtils from '../../../utils/LogUtils';
import GroupsRepo from '../../../repos/GroupsRepo';
import constants from '../../../utils/Constants';

class GetGroupPollsRouter extends AppDevRouter<Object> {
    constructor() {
        super(constants.REQUEST_TYPES.GET);
    }

    getPath(): string {
        return '/groups/:id/polls/';
    }

    async content(req: Request) {
        const { id } = req.params;
        const isAdmin = await GroupsRepo.isAdmin(id, req.user);
        const polls = await GroupsRepo.getPolls(id, !isAdmin);
        if (!polls) throw LogUtils.logError(`Problem getting polls from group id: ${id}!`);

        // Date mapped to list of polls
        const pollsByDate = {};
        polls.filter(Boolean).forEach((poll) => {
            let date = (new Date(1000 * poll.createdAt)).toDateString();
            // Date string has format 'Wed Oct 03 2018'
            date = date.substring(date.indexOf(' '));
            const p = {
                id: poll.id,
                text: poll.text,
                results: poll.results,
                shared: poll.shared,
                type: poll.type,
                answer: isAdmin ? null : poll.userAnswers[req.user.googleID],
                correctAnswer: poll.correctAnswer,
            };
            if (pollsByDate[date]) {
                pollsByDate[date].push(p);
            } else {
                pollsByDate[date] = [p];
            }
        });
        return pollsByDate;
    }
}

export default new GetGroupPollsRouter().router;
