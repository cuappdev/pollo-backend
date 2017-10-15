// @flow
import { Request } from 'express';
import AppDevRouter from '../utils/AppDevRouter';
import OrganizationsRepo from '../repos/OrganizationsRepo';

class GetUsersRouter extends AppDevRouter {
  constructor() {
    super('POST');
  }

  getPath(): string {
    return '/organizations/';
  }

  async content(req: Request) {
    const name = req.body.name
    if (!name) throw new Error('Name missing')
    const org = await OrganizationsRepo.createOrganization(name)
    return {
      node: org,
    }
  }
}

export default new GetUsersRouter().router;
