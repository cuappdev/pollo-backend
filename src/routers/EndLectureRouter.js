// @flow
import {Request} from 'express';
import AppDevRouter from '../utils/AppDevRouter';
import socket from 'socket.io';
import LectureSocket from '../LectureSocket';
import constants from '../utils/constants';

class EndLectureRouter extends AppDevRouter {
  constructor () {
    super(constants.REQUEST_TYPES.POST);
  }

  getPath (): string {
    return '/end-lecture/';
  }

  async content (req: Request) {
    // Close socket with namespace of lectureId
    return {}
  }
}

export default new EndLectureRouter().router;
