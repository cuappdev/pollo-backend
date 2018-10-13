// @flow
import AppDevEdgeRouter from '../../../utils/AppDevEdgeRouter';
import SessionsRepo from '../../../repos/SessionsRepo';
import constants from '../../../utils/Constants';
import type { APIUser } from '../APITypes';

class GetAdminsRouter extends AppDevEdgeRouter<APIUser> {
    constructor() {
        super(constants.REQUEST_TYPES.GET);
    }

    getPath(): string {
        return '/sessions/:id/admins/';
    }

    async contentArray(req, pageInfo, error) {
        const { id } = req.params;
        const users = await SessionsRepo.getUsersBySessionId(id, 'admin');
        return users
            .filter(Boolean)
            .map(user => ({
                node: {
                    id: user.id,
                    name: `${user.firstName} ${user.lastName}`,
                    netId: user.netId,
                },
                cursor: user.createdAt.valueOf(),
            }));
    }
}

export default new GetAdminsRouter().router;
