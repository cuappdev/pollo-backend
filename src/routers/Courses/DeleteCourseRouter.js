// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import CoursesRepo from '../../repos/CoursesRepo';
import constants from '../../utils/constants';

class DeleteCourseRouter extends AppDevRouter {
  constructor () {
    super(constants.REQUEST_TYPES.DELETE);
  }

  getPath (): string {
    return '/courses/:id/';
  }

  async content (req: Request) {
    const courseId = req.params.id;
    await CoursesRepo.deleteCourseById(courseId);
    return null;
  }
}

export default new DeleteCourseRouter().router;
