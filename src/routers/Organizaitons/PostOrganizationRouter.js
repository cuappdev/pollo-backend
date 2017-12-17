// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import OrganizationsRepo from '../../repos/OrganizationsRepo';
import constants from '../../utils/constants';

class PostOrganizationRouter extends AppDevRouter<Object> {
  constructor () {
    super(constants.REQUEST_TYPES.POST);
  }

  getPath (): string {
    return '/organizations/';
  }

  async content (req: Request) {
    const name = req.body.name;
    if (!name) throw new Error('Name missing');
    const org = await OrganizationsRepo.createOrganization(name);
    return {
      node: org
    };
  }
}

export default new PostOrganizationRouter().router;
