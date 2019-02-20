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
        return '/sessions/:id/questions/date/';
    }

    async content(req: Request) {
        const { id } = req.params;
        const questions = await GroupsRepo.getQuestions(id);
        if (!questions) {
            throw LogUtils.logErr({ message: `Problem getting questions from group id: ${id}!` });
        }
        // Array of objects with a date and the date's questions
        const questionsByDate = {};
        questions.filter(Boolean).forEach((question) => {
            let date = (new Date(1000 * question.createdAt)).toLocaleString();
            date = date.substring(0, date.indexOf(','));
            questionsByDate.date = date;
            const q = {
                id: question.id,
                text: question.text,
            };
            if (questionsByDate.questions) {
                questionsByDate.questions.push(q);
            } else {
                questionsByDate.questions = [q];
            }
        });
        return Object.keys(questionsByDate).length === 0 ? [] : [questionsByDate];
    }
}

export default new GetGroupQuestionsRouter().router;
