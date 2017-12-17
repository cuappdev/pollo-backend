// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import OrganizationsRepo from '../../repos/OrganizationsRepo';
import constants from '../../utils/constants';

class DeleteOrganizationRouter extends AppDevRouter<Object> {
  constructor () {
    super(constants.REQUEST_TYPES.DELETE);
  }

  getPath (): string {
    return '/organizations/:id/';
  }

  async content (req: Request) {
    const orgId = req.params.id;
    await OrganizationsRepo.deleteOrgById(orgId);
    return null;
  }
}

export default new DeleteOrganizationRouter().router;
