// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import UsersRepo from '../../repos/UsersRepo';

class GetUserCoursesRouter extends AppDevRouter {
  constructor () {
    super('GET');
  }

  getPath (): string {
    return '/users/:id/courses/';
  }

  async content (req: Request) {
    const role = req.body.role;
    const id = req.params.id;
    const courses = await UsersRepo.getAssocCoursesByUserId(id, role);
    if (!courses) throw new Error('Courses not found for user');
    return courses
      .filter(Boolean)
      .map(course => ({
        node: {
          id: course.id,
          name: course.name,
          term: course.term,
        },
      }));
  }
}

export default new GetUserCoursesRouter().router;
