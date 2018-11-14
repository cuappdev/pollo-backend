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
        const { name, deviceID } = req.body;
        const pollID = req.params.id;

        let poll = await GroupsRepo.getGroupByID(pollID);
        if (!poll) throw new Error(`Poll with id ${pollID} was not found!`);

        const users = await GroupsRepo.getUsersByGroupID(pollID, 'admin');
        if (users && users[0] && deviceID !== users[0].googleID) {
            throw new Error('You are not authorized to delete this poll!');
        }

        if (!name) throw new Error('No fields specified to update.');

        poll = await GroupsRepo.updateGroupByID(pollID, name);
        if (!poll) throw new Error(`Poll with id ${pollID} was not found!`);
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
