// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import OrganizationsRepo from '../../repos/OrganizationsRepo';
import constants from '../../utils/constants';

class UpdateOrganizationRouter extends AppDevRouter {
  constructor () {
    super(constants.REQUEST_TYPES.PUT);
  }

  getPath (): string {
    return '/organizations/:id/';
  }

  async content (req: Request) {
    const orgId = req.params.id;
    const name = req.body.name;
    if (!name) throw new Error('Name missing');
    const org = await OrganizationsRepo.updateOrgById(orgId, name);
    return {
      node: org
    };
  }
}

export default new UpdateOrganizationRouter().router;
