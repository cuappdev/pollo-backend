// @flow
import AppDevNodeRouter from '../../utils/AppDevNodeRouter';
import OrganizationsRepo from '../../repos/OrganizationsRepo';

import type { APIOrganization } from 'clicker-types';

class GetOrganization extends AppDevNodeRouter<APIOrganization> {
  getPath (): string {
    return '/organizations/:id/';
  }

  async fetchWithId (id) {
    const org = await OrganizationsRepo.getOrgById(id);
    return org && {
      id: org.id,
      name: org.name
    };
  }
}

export default new GetOrganization().router;
