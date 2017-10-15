// @flow
import { Request } from 'express';
import AppDevEdgeRouter from '../../utils/AppDevEdgeRouter';
import constants from '../../utils/constants';
import OrganizationsRepo from '../../repos/OrganizationsRepo'

import type { APIOrganization } from '../APITypes'

class GetOrganizations extends AppDevEdgeRouter<APIOrganization> {

  constructor() {
    super(constants.REQUEST_TYPES.GET);
  }

  getPath(): string {
    return '/organizations/';
  }

  async contentArray(req, pageInfo, error) {

    const orgs = await OrganizationsRepo
      .paginateOrganization(pageInfo.cursor || 0, pageInfo.count)

    return orgs
      // filters falsy entries out
      .filter(Boolean)
      .map(org => ({
        node: {
          id: org.id,
          name: org.name,
        },
        cursor: org.createdAt.valueOf(),
      }));
  }
}

export default new GetOrganizations().router;
