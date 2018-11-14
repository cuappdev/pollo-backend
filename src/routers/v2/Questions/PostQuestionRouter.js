// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import LogUtils from '../../../utils/LogUtils';
import QuestionsRepo from '../../../repos/QuestionsRepo';
import GroupsRepo from '../../../repos/GroupsRepo';
import constants from '../../../utils/Constants';

import type { APIQuestion } from '../APITypes';

class PostQuestionRouter extends AppDevRouter<Object> {
    constructor() {
        super(constants.REQUEST_TYPES.POST);
    }

    getPath(): string {
        return '/groups/:id/questions/';
    }

    async content(req: Request): Promise<{ node: APIQuestion }> {
        const groupId = req.params.id;
        const { text } = req.body;
        const { user } = req;

        if (!text) throw LogUtils.logError('Cannot post empty question!');

        const group = await GroupsRepo.getGroupById(groupId);
        if (!group) throw LogUtils.logError(`Couldn't find group with id ${groupId}`);

        if (!await GroupsRepo.isMember(groupId, user)) {
            throw LogUtils.logError('You are not authorized to post a poll!');
        }

        const poll = await QuestionsRepo.createQuestion(text, group, user);

        return {
            node: {
                id: poll.id,
                text: poll.text,
            },
        };
    }
}

export default new PostQuestionRouter().router;
