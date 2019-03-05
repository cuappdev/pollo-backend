// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';
import LogUtils from '../../../utils/LogUtils';
import QuestionsRepo from '../../../repos/QuestionsRepo';

import type { APIQuestion } from '../APITypes';

class GetQuestionRouter extends AppDevRouter<APIQuestion> {
    constructor() {
        super(constants.REQUEST_TYPES.GET);
    }

    getPath(): string {
        return '/questions/:id/';
    }

    async content(req: Request) {
        const { id } = req.params;
        const question = await QuestionsRepo.getQuestionByID(id);
        if (!question) throw LogUtils.logErr(`Question with id ${id} cannot be found`);

        return question && {
            id: question.id,
            text: question.text,
        };
    }
}

export default new GetQuestionRouter().router;
