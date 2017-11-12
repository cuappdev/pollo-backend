// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import CoursesRepo from '../../repos/CoursesRepo';
import constants from '../../utils/constants';

class AddStudentsToCourseRouter extends AppDevRouter {
  constructor () {
    super(constants.REQUEST_TYPES.POST);
  }

  getPath (): string {
    return '/course/register/';
  }

  async content (req: Request) {
    const courseCode = req.body.code;

    // Students should follow format [ id, id2, id3 ]
    const students = req.body.students;
    if (!students) throw new Error('Body parameter \'students\' are missing!');

    if (typeof students !== 'object') {
      throw new Error('Students must be a list of student ids');
    }
    const id = await CoursesRepo.getCourseId(courseCode);
    await CoursesRepo.addStudents(id, students);

    return null;
  }
}

export default new AddStudentsToCourseRouter().router;
