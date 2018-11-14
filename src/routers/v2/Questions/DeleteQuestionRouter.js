// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import LogUtils from '../../../utils/LogUtils';
import QuestionsRepo from '../../../repos/QuestionsRepo';
import GroupsRepo from '../../../repos/GroupsRepo';
import constants from '../../../utils/Constants';

class DeleteQuestionRouter extends AppDevRouter<Object> {
    constructor() {
        super(constants.REQUEST_TYPES.DELETE);
    }

    getPath(): string {
        return '/questions/:id/';
    }

    async content(req: Request) {
        const questionId = req.params.id;
        const { user } = req;

        const group = await QuestionsRepo.getGroupFromQuestionId(questionId);
        if (!group) {
            throw LogUtils.logError(`Couldn't find group with question ${questionId}`);
        }
        if (!await GroupsRepo.isAdmin(group.id, user)
          && !await QuestionsRepo.isOwnerById(questionId, user)) {
            throw LogUtils.logError('You are not authorized to delete this question!');
        }
        await QuestionsRepo.deleteQuestionById(questionId);
        return null;
    }
}

export default new DeleteQuestionRouter().router;
