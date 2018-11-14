// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import GroupsRepo from '../../../repos/GroupsRepo';
import constants from '../../../utils/Constants';

import type { APIPoll } from '../APITypes';

class UpdatePollRouter extends AppDevRouter<Object> {
    constructor() {
        super(constants.REQUEST_TYPES.PUT, false);
    }

    getPath(): string {
        return '/polls/:id/';
    }

    async content(req: Request): Promise<{ node: APIPoll }> {
        const { name, deviceId } = req.body;
        const pollId = req.params.id;

        let poll = await GroupsRepo.getGroupById(pollId);
        if (!poll) throw new Error(`Poll with id ${pollId} was not found!`);

        const users = await GroupsRepo.getUsersByGroupId(pollId, 'admin');
        if (users && users[0] && deviceId !== users[0].googleId) {
            throw new Error('You are not authorized to delete this poll!');
        }

        if (!name) throw new Error('No fields specified to update.');

        poll = await GroupsRepo.updateGroupById(pollId, name);
        if (!poll) throw new Error(`Poll with id ${pollId} was not found!`);
        return {
            node: {
                id: poll.id,
                name: poll.name,
                code: poll.code,
            },
        };
    }
}

export default new UpdatePollRouter().router;
