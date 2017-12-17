// @flow
import AppDevRouter from '../utils/AppDevRouter';
import constants from '../utils/constants';
import LectureManager from '../LectureManager';
import LecturesRepo from '../repos/LecturesRepo';
import { Request } from 'express';
import socket from 'socket.io';

class EndLectureRouter extends AppDevRouter<Object> {
  constructor () {
    super(constants.REQUEST_TYPES.POST);
  }

  getPath (): string {
    return '/lectures/:id/end/';
  }

  async content (req: Request) {
    const id = req.params.id;
    const lecture = await LecturesRepo.getLectureById(id);

    if (!lecture) {
      throw new Error(`No lecture with id ${id} found.`);
    }

    LectureManager.endLecture(lecture);
    return {};
  }
}

export default new EndLectureRouter().router;
