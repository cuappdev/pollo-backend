// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import constants from '../../utils/constants';
import UsersRepo from '../../repos/UsersRepo';
import LecturesRepo from '../../repos/LecturesRepo';
import LectureManager from '../../LectureManager';

class GetLiveLecturesRouter extends AppDevRouter {
  constructor () {
    super(constants.REQUEST_TYPES.GET);
  }

  getPath (): string {
    return '/users/:userId/lectures/';
  }

  async content (req: Request) {
    const userId = req.params.userId;
    // const live = req.query.live;

    if (!userId) throw new Error('User id is missing!');

    const courses = await UsersRepo.getAssocCoursesByUserId(userId, 'student');
    const lectures = await LectureManager.liveLectures(courses);
    return lectures
      .filter(Boolean)
      .map(lecture => ({
        node: {
          id: lecture.id,
          dateTime: lecture.dateTime,
          courseName: lecture.course.name,
        },
      }));
  }
}

export default new GetLiveLecturesRouter().router;
