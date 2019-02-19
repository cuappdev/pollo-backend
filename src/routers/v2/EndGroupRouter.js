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
        return '/sessions/:id/end/';
    }

    async content(req: Request) {
        const { id, save } = req.params;

        const group = await GroupsRepo.getGroupByID(id);
        if (!group) {
            throw LogUtils.logErr({ message: `No group with id ${id} found!` });
        }

        if (!(await GroupsRepo.isAdmin(id, req.user))) {
            throw LogUtils.logErr({ message: `Not authorized to end group with id ${id}` });
        }

        if (save === 'false' || save === '0') {
            await GroupsRepo.deleteGroupByID(id);
        }

        await req.app.groupManager.endGroup(group, save);
        return null;
    }
}

export default new EndGroupRouter().router;
