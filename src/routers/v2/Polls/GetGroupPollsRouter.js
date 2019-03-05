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
        return '/sessions/:id/polls/';
    }

    async content(req: Request) {
        const { id } = req.params;
        const isAdmin = await GroupsRepo.isAdmin(id, req.user);
        const polls = await GroupsRepo.getPolls(id, !isAdmin);
        if (!polls) throw LogUtils.logErr(`Problem getting polls from group id: ${id}`);

        // List of all dates
        const datesArray = [];
        // Date mapped to list of polls
        const pollsByDate = [];
        polls.filter(Boolean).forEach((poll) => {
            // date is in Unix time in seconds
            const date = poll.createdAt;
            const p = {
                id: poll.id,
                text: poll.text,
                results: poll.results,
                shared: poll.shared,
                type: poll.type,
                answer: isAdmin ? null : poll.userAnswers[req.user.googleID],
                correctAnswer: poll.correctAnswer,
            };
            const ind = datesArray.indexOf(date);
            if (ind === -1) { // date not found
                datesArray.push(date);
                pollsByDate.push({ date, polls: [p] });
            } else { // date found
                pollsByDate[ind].polls.push(p);
            }
        });
        return pollsByDate;
    }
}

export default new GetGroupPollsRouter().router;
