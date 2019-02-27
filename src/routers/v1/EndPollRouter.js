// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import constants from '../../utils/Constants';
import GroupsRepo from '../../repos/GroupsRepo';

class EndPollRouter extends AppDevRouter<Object> {
    constructor() {
        super(constants.REQUEST_TYPES.POST);
    }

    middleware() {
        return (req, res, next) => next();
    }

    getPath(): string {
        return '/polls/:id/end/';
    }

    async content(req: Request) {
        const { id } = req.params;
        const { save } = req.body;

        const poll = await GroupsRepo.getGroupByID(id);
        if (!poll) {
            throw new Error(`No poll with id ${id} found.`);
        }

        if (save === 'false' || save === '0') {
            await GroupsRepo.deleteGroupByID(id);
        }

        req.app.groupManager.endGroup(poll, save);

        return null;
    }
}

export default new EndPollRouter().router;
