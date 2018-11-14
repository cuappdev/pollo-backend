// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import LogUtils from '../../../utils/LogUtils';
import GroupsRepo from '../../../repos/GroupsRepo';
import constants from '../../../utils/Constants';

class GetGroupQuestionsRouter extends AppDevRouter<Object> {
    constructor() {
        super(constants.REQUEST_TYPES.GET);
    }

    getPath(): string {
        return '/groups/:id/questions/date/';
    }

    async content(req: Request) {
        const { id } = req.params;
        const questions = await GroupsRepo.getQuestions(id);
        if (!questions) {
            throw LogUtils.logError(`Problem getting questions from group id: ${id}!`);
        }
        // Date mapped to list of questions
        const questionsByDate = {};
        questions.filter(Boolean).forEach((question) => {
            let date = (new Date(1000 * question.createdAt)).toLocaleString();
            date = date.substring(0, date.indexOf(','));
            const q = {
                id: question.id,
                text: question.text,
            };
            if (questionsByDate[date]) {
                questionsByDate[date].push(q);
            } else {
                questionsByDate[date] = [q];
            }
        });
        return questionsByDate;
    }
}

export default new GetGroupQuestionsRouter().router;
