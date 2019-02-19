// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';
import LogUtils from '../../../utils/LogUtils';
import GroupsRepo from '../../../repos/GroupsRepo';
import UsersRepo from '../../../repos/UsersRepo';

class GetGroupsRouter extends AppDevRouter<Object> {
    constructor() {
        super(constants.REQUEST_TYPES.GET);
    }

    getPath(): string {
        return '/sessions/all/admin/';
    }

    async content(req: Request) {
        const groups = await UsersRepo.getGroupsByID(req.user.id, 'admin');
        if (!groups) throw LogUtils.logErr({ message: 'Can\'t find groups for user!' });
        const nodes = await groups
            .filter(Boolean)
            .map(async group => ({
                node: {
                    id: group.id,
                    name: group.name,
                    code: group.code,
                    updatedAt: await GroupsRepo.latestActivityByGroupID(group.id),
                    isLive: await req.app.groupManager.isLive(group.code),
                },
            }));
        return Promise.all(nodes).then(n => n);
    }
}

export default new GetGroupsRouter().router;
