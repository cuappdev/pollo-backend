// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import QuestionsRepo from '../../../repos/QuestionsRepo';
import SessionsRepo from '../../../repos/SessionsRepo';
import constants from '../../../utils/Constants';

import type { APIQuestion } from '../APITypes';

class PostQuestionRouter extends AppDevRouter<Object> {
    constructor() {
        super(constants.REQUEST_TYPES.POST);
    }

    getPath(): string {
        return '/sessions/:id/questions/';
    }

    async content(req: Request): Promise<{ node: APIQuestion }> {
        const sessionId = req.params.id;
        const { text } = req.body;
        const { user } = req;

        if (!text) throw new Error('Cannot post empty question!');

        const session = await SessionsRepo.getSessionById(sessionId);
        if (!session) throw new Error(`Couldn't find session with id ${sessionId}`);

        if (!await SessionsRepo.isMember(sessionId, user)) {
            throw new Error('You are not authorized to post a poll!');
        }

        const poll = await QuestionsRepo.createQuestion(text, session, user);

        return {
            node: {
                id: poll.id,
                text: poll.text,
            },
        };
    }
}

export default new PostQuestionRouter().router;
