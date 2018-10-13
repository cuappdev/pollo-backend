// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import SessionsRepo from '../../../repos/SessionsRepo';
import constants from '../../../utils/Constants';

class GetSessionPollsRouter extends AppDevRouter<Object> {
    constructor() {
        super(constants.REQUEST_TYPES.GET);
    }

    getPath(): string {
        return '/sessions/:id/polls/';
    }

    async content(req: Request) {
        const { id } = req.params;
        const isAdmin = await SessionsRepo.isAdmin(id, req.user);
        const polls = await SessionsRepo.getPolls(id, !isAdmin);
        if (!polls) throw new Error(`Problem getting polls from session id: ${id}!`);

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
                answer: isAdmin ? null : poll.userAnswers[req.user.googleId],
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

export default new GetSessionPollsRouter().router;
