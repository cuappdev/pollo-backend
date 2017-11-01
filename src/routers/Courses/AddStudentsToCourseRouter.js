// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import CoursesRepo from '../../repos/CoursesRepo';

class AddStudentsToCourseRouter extends AppDevRouter {
  constructor () {
    super('POST');
  }

  getPath (): string {
    return '/courses/:id/students/';
  }

  async content (req: Request) {
    const courseId = req.params.id;

    // Students should follow format '[ id, id2, id3 ]'
    var students = req.body.students;
    if (!students) throw new Error('Students are missing');

    try {
      students = JSON.parse(students);
      if (typeof students !== 'object') {
        throw new Error('Students must be a list of student ids');
      }
    } catch (e) {
      throw new Error('Students must be a list of student ids');
    }
    await CoursesRepo.addStudents(courseId, students);

    return {};
  }
}

export default new AddStudentsToCourseRouter().router;
