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

    async fetchWithID(id: number, req: Request) {
        const question = await QuestionsRepo.getQuestionByID(id);
        if (!question) throw LogUtils.logErr(`Question with id ${id} cannot be found`);

        return question && {
            id: question.id,
            text: question.text,
        };
    }
}

export default new GetQuestionRouter().router;
