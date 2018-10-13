// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import QuestionsRepo from '../../../repos/QuestionsRepo';
import constants from '../../../utils/Constants';

import type { APIQuestion } from '../APITypes';

class UpdateQuestionRouter extends AppDevRouter<Object> {
    constructor() {
        super(constants.REQUEST_TYPES.PUT);
    }

    getPath(): string {
        return '/questions/:id/';
    }

    async content(req: Request): Promise<{ node: APIQuestion }> {
        const questionId = req.params.id;
        const { text } = req.body;
        const { user } = req;

        if (!text) throw new Error('No fields specified to update.');

        const session = await QuestionsRepo.getSessionFromQuestionId(questionId);
        if (!session) throw new Error(`Question with id ${questionId} has no session!`);

        if (!await QuestionsRepo.isOwnerById(questionId, user)) {
            throw new Error('You are not authorized to update this question!');
        }
        const question = await QuestionsRepo.updateQuestionById(questionId, text);
        if (!question) {
            throw new Error(`Question with id ${questionId} was not found!`);
        }

        return {
            node: {
                id: question.id,
                text: question.text,
            },
        };
    }
}

export default new UpdateQuestionRouter().router;
