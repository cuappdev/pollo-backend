// @flow
import AppDevEdgeRouter from '../../utils/AppDevEdgeRouter';
import GroupsRepo from '../../repos/GroupsRepo';
import constants from '../../utils/constants';
import type { APIUser } from '../APITypes';

class GetGroupAdminsRouter extends AppDevEdgeRouter<APIUser> {
  constructor () {
    super(constants.REQUEST_TYPES.GET);
  }

  getPath (): string {
    return '/groups/:id/admins/';
  }

  async contentArray (req, pageInfo, error) {
    const id = req.params.id;
    const users = await GroupsRepo.getUsersByGroupId(id, 'admin');
    return users
      .filter(Boolean)
      .map(function (user) {
        return {
          node: {
            id: user.id,
            name: user.firstName + ' ' + user.lastName,
            netId: user.netId
          },
          cursor: user.createdAt.valueOf()
        };
      });
  }
}

export default new GetGroupAdminsRouter().router;
