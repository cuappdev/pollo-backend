// @flow
import { Request } from 'express';
import AppDevRouter from '../utils/AppDevRouter';
import LecturesRepo from '../repos/LecturesRepo';

class PostLectureRouter extends AppDevRouter {
  constructor () {
    super('POST');
  }

  getPath (): string {
    return '/courses/:id/lectures/';
  }

  async content (req: Request) {
    const courseId = req.params.id;
    const dateTime = req.body.dateTime;
    if (!dateTime) throw new Error('dateTime missing');
    const lec = await LecturesRepo.createLecture(dateTime, courseId);
    return {
      node: {
        id: String(lec.id),
        dateTime: dateTime
      }
    };
  }
}

export default new PostLectureRouter().router;
