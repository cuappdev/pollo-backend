// @flow
import { Request } from 'express';
import AppDevEdgeRouter from '../utils/AppDevEdgeRouter';
import constants from '../utils/constants';
import CoursesRepo from '../repos/CoursesRepo'

import type { APICourse } from './APITypes'

class GetOrganizations extends AppDevEdgeRouter<APICourse> {

  constructor() {
    super(constants.REQUEST_TYPES.GET);
  }

  getPath(): string {
    return '/organizations/:id/courses/';
  }

  async contentArray(req, pageInfo, error) {

    const id = req.params.id
    const courses = await CoursesRepo
      .paginateCourseByOrgId(id, pageInfo.cursor, pageInfo.count)

    return courses
      .filter(Boolean)
      .map(course => ({
        node: {
          id: course.id,
          name: course.name,
          term: course.term,
        },
        cursor: course.createdAt.valueOf(),
      }));
  }
}

export default new GetOrganizations().router;
