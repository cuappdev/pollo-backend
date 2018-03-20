// @flow
import AppDevNodeRouter from '../../utils/AppDevNodeRouter';
import GroupsRepo from '../../repos/GroupsRepo';

import type { APIGroup } from '../APITypes';

class GetGroupRouter extends AppDevNodeRouter<APIGroup> {
  getPath (): string {
    return '/groups/:id/';
  }

  async fetchWithId (id: number) {
    const group = await GroupsRepo.getGroupById(id);
    return group && {
      id: group.id,
      name: group.name,
      code: group.code
    };
  }
}

export default new GetGroupRouter().router;
