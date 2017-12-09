// @flow
import AppDevRouter from '../utils/AppDevRouter';
import constants from '../utils/constants';
import LectureManager from '../LectureManager';
import LecturesRepo from '../repos/LecturesRepo';
import {Request} from 'express';
import socket from 'socket.io';

class StartLectureRouter extends AppDevRouter<Object> {
  constructor () {
    super(constants.REQUEST_TYPES.POST);
  }

  getPath (): string {
    return '/lectures/:id/start/';
  }

  async content (req: Request) {
    const id = req.params.id;
    const lecture = await LecturesRepo.getLectureWithCourse(id);

    if (!lecture) {
      throw new Error(`No lecture with id ${id} found.`);
    }

    const { port } = await LectureManager.startNewLecture(lecture);
    return {port};
  }
}

export default new StartLectureRouter().router;
