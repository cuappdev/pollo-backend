// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';
import GroupsRepo from '../../../repos/GroupsRepo';
import LogUtils from '../../../utils/LogUtils';

import type { APIGroup } from '../APITypes';

class PostGroupRouter extends AppDevRouter<APIGroup> {
  constructor() {
    super(constants.REQUEST_TYPES.POST);
  }

  getPath(): string {
    return '/sessions/';
  }

  async content(req: Request) {
    let { name } = req.body;
    const { user, body: { code } } = req;

    if (!name) name = '';
    if (!user) throw LogUtils.logErr('User missing');
    if (!code) throw LogUtils.logErr('Group code missing');

    const group = await GroupsRepo.createGroup(name, code, user);

    return group.serialize();
  }
}

export default new PostGroupRouter().router;
