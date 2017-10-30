// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import LecturesRepo from '../../repos/LecturesRepo';

class DeleteLectureRouter extends AppDevRouter {
  constructor () {
    super('DELETE');
  }

  getPath (): string {
    return '/lectures/:id/';
  }

  async content (req: Request) {
    const lectureId = req.params.id;
    await LecturesRepo.deleteLectureById(lectureId);
    return {};
  }
}

export default new DeleteLectureRouter().router;
