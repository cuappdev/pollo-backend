// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import CoursesRepo from '../../repos/CoursesRepo';
import constants from '../../utils/constants';

import type { APICourse } from 'clicker-types';

class PostCourseRouter extends AppDevRouter {
  constructor () {
    super(constants.REQUEST_TYPES.POST);
  }

  getPath (): string {
    return '/organizations/:id/courses/';
  }

  async content (req: Request): Promise<{ node: APICourse }> {
    const name = req.body.name;
    const term = req.body.term;
    const orgId = req.params.id;
    const adminId = /** TODO: GET THIS FROM SENT CREDENTIALS */ 0;

    if (!name) throw new Error('Name missing');
    if (!term) throw new Error('Term missing');

    const course = await CoursesRepo
      .createCourse(name, term, orgId, adminId);

    return {
      node: {
        id: course.id,
        term: course.term,
        name: course.name,
        code: course.code
      }
    };
  }
}

export default new PostCourseRouter().router;
