// @flow
import AppDevEdgeRouter from '../../../utils/AppDevEdgeRouter';
import QuestionsRepo from '../../../repos/QuestionsRepo';
import constants from '../../../utils/constants';
import type { APIQuestion } from '../APITypes';

class GetQuestionsRouter extends AppDevEdgeRouter<APIQuestion> {
    constructor() {
        super(constants.REQUEST_TYPES.GET);
    }

    getPath(): string {
        return '/sessions/:id/questions/';
    }

    async contentArray(req, pageInfo, error) {
        const { id } = req.params;
        const questions = await QuestionsRepo.getQuestionsFromSessionId(id);

        return questions
            .filter(Boolean)
            .map(question => ({
                node: {
                    id: question.id,
                    text: question.text,
                },
                cursor: question.createdAt.valueOf(),
            }));
    }
}

export default new GetQuestionsRouter().router;
