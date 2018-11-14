// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import LogUtils from '../../../utils/LogUtils';
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

        if (!text) throw LogUtils.logError('No fields specified to update.');

        const group = await QuestionsRepo.getGroupFromQuestionId(questionId);
        if (!group) throw LogUtils.logError(`Question with id ${questionId} has no group!`);

        if (!await QuestionsRepo.isOwnerById(questionId, user)) {
            throw LogUtils.logError('You are not authorized to update this question!');
        }
        const question = await QuestionsRepo.updateQuestionById(questionId, text);
        if (!question) {
            throw LogUtils.logError(`Question with id ${questionId} was not found!`);
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
