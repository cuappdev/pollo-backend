// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import constants from '../../utils/Constants';
import GroupsRepo from '../../repos/GroupsRepo';
import type { APIPoll } from './APITypes';

class StartPollRouter extends AppDevRouter<APIPoll> {
    constructor() {
        super(constants.REQUEST_TYPES.POST, false);
    }

    getPath(): string {
        return '/start/poll/';
    }

    async content(req: Request) {
        const { id, code } = req.body;
        let { name } = req.body;

        if (!name) name = '';
        let poll = await GroupsRepo.getGroupByID(id);

        if (!(id || code)) {
            throw new Error('Poll id, or code and device id required.');
        }

        if (!id) {
            poll = await GroupsRepo.createGroup(name, code, null);
        }

        if (!poll) {
            throw new Error(`No poll with id ${id} found.`);
        }

        await req.app.groupManager.startNewGroup(poll);

        return {
            node: {
                id: poll.id,
                name: poll.name,
                code: poll.code,
            },
        };
    }
}

export default new StartPollRouter().router;
