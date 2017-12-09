// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import CoursesRepo from '../../repos/CoursesRepo';
import constants from '../../utils/constants';

import type { APICourse } from '../APITypes';

class UpdateCourseRouter extends AppDevRouter<Object> {
  constructor () {
    super(constants.REQUEST_TYPES.PUT);
  }

  getPath (): string {
    return '/courses/:id/';
  }

  async content (req: Request): Promise<{ node: APICourse }> {
    const name = req.body.name;
    const term = req.body.term;
    const courseId = req.params.id;

    if (!name && !term) throw new Error('No fields specified to update.');

    const course = await CoursesRepo.updateCourseById(courseId, name, term);
    if (!course) throw new Error(`Course with id ${courseId} was not found!`);
    return {
      node: {
        id: course.id,
        term: course.term,
        name: course.name,
        code: course.code,
      }
    };
  }
}

export default new UpdateCourseRouter().router;
