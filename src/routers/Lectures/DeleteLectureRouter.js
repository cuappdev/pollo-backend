// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import LecturesRepo from '../../repos/LecturesRepo';
import constants from '../../utils/constants';

class DeleteLectureRouter extends AppDevRouter<Object> {
  constructor () {
    super(constants.REQUEST_TYPES.DELETE);
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
