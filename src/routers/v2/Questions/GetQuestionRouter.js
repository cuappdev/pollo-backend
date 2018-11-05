// @flow
import { Request } from 'express';
import AppDevNodeRouter from '../../../utils/AppDevNodeRouter';
import LogUtils from '../../../utils/LogUtils';
import QuestionsRepo from '../../../repos/QuestionsRepo';

import type { APIQuestion } from '../APITypes';

class GetQuestionRouter extends AppDevNodeRouter<APIQuestion> {
    getPath(): string {
        return '/questions/:id/';
    }

    async fetchWithId(id: number, req: Request) {
        const question = await QuestionsRepo.getQuestionById(id);
        if (!question) throw LogUtils.logError(`Question with id ${id} cannot be found`);

        return question && {
            id: question.id,
            text: question.text,
        };
    }
}

export default new GetQuestionRouter().router;
