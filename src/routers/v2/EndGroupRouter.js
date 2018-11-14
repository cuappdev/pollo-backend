// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import constants from '../../utils/Constants';
import LogUtils from '../../utils/LogUtils';
import GroupsRepo from '../../repos/GroupsRepo';

class EndGroupRouter extends AppDevRouter<Object> {
    constructor() {
        super(constants.REQUEST_TYPES.POST);
    }

    getPath(): string {
        return '/groups/:id/end/';
    }

    async content(req: Request) {
        const { id, save } = req.params;

        const group = await GroupsRepo.getGroupById(id);
        if (!group) {
            throw LogUtils.logError(`No group with id ${id} found.`);
        }

        if (!(await GroupsRepo.isAdmin(id, req.user))) {
            throw LogUtils.logError('Not authorized to end group.');
        }

        if (save === 'false' || save === '0') {
            await GroupsRepo.deleteGroupById(id);
        }

        await req.app.groupManager.endGroup(group, save);

        return null;
    }
}

export default new EndGroupRouter().router;
