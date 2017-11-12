// @flow
import AppDevNodeRouter from '../../utils/AppDevNodeRouter';
import CoursesRepo from '../../repos/CoursesRepo';

import type { APICourse } from 'clicker-types';

class GetCourse extends AppDevNodeRouter<APICourse> {
  getPath (): string {
    return '/courses/:id/';
  }

  async fetchWithId (id: number) {
    const course = await CoursesRepo.getCourseById(id);
    return course && {
      id: course.id,
      name: course.name,
      term: course.term,
      code: course.code
    };
  }
}

export default new GetCourse().router;
