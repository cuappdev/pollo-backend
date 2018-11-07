// @flow
import { Request } from 'express';
import AppDevNodeRouter from '../../../utils/AppDevNodeRouter';
import LogUtils from '../../../utils/LogUtils';
import PollsRepo from '../../../repos/PollsRepo';
import SessionsRepo from '../../../repos/SessionsRepo';

import type { APIPoll } from '../APITypes';

class GetPollRouter extends AppDevNodeRouter<APIPoll> {
    getPath(): string {
        return '/polls/:id/';
    }

    async fetchWithId(id: number, req: Request) {
        const poll = await PollsRepo.getPollById(id);
        if (!poll) throw LogUtils.logError(`Poll with id ${id} cannot be found`);

        const session = await PollsRepo.getSessionFromPollId(poll.id);
        if (!session) throw LogUtils.logError(`Session with id ${id} cannot be found`);

        const isAdmin = await SessionsRepo.isAdmin(session.id, req.user);

        return poll && {
            id: poll.id,
            text: poll.text,
            results: poll.results,
            shared: poll.shared,
            type: poll.type,
            answer: isAdmin ? null : poll.userAnswers[req.user.googleId],
        };
    }
}

export default new GetPollRouter().router;
