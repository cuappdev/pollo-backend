// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import LogUtils from '../../../utils/LogUtils';
import PollsRepo from '../../../repos/PollsRepo';
import SessionsRepo from '../../../repos/SessionsRepo';
import constants from '../../../utils/Constants';

import type { APIPoll } from '../APITypes';

class PostPollRouter extends AppDevRouter<Object> {
    constructor() {
        super(constants.REQUEST_TYPES.POST);
    }

    getPath(): string {
        return '/sessions/:id/polls/';
    }

    async content(req: Request): Promise<{ node: APIPoll }> {
        const sessionId = req.params.id;
        let { text, results, shared } = req.body;
        const { type, correctAnswer } = req.body;
        const { user } = req;

        if (!text) text = '';
        if (!results) results = {};
        if (shared === null) shared = false;
        if (type !== 'FREE_RESPONSE' && type !== 'MULTIPLE_CHOICE') {
            throw LogUtils.logError('Valid poll type not found');
        }

        const session = await SessionsRepo.getSessionById(sessionId);
        if (!session) throw LogUtils.logError(`Couldn't find session with id ${sessionId}`);

        if (!await SessionsRepo.isAdmin(sessionId, user)) {
            throw LogUtils.logError('You are not authorized to post a poll!');
        }

        const poll = await PollsRepo
            .createPoll(text, session, results, shared, type, correctAnswer);

        return {
            node: {
                id: poll.id,
                text: poll.text,
                results: poll.results,
                shared: poll.shared,
                type: poll.type,
                answer: null,
                correctAnswer: poll.correctAnswer,
            },
        };
    }
}

export default new PostPollRouter().router;
