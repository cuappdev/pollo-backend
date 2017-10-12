// @flow
import {Request} from 'express';
import AppDevRouter from '../utils/AppDevRouter';
import socket from 'socket.io';
import SocketServer from '../SocketServer';
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
    const profId = req.body.profId;
    const lectureId = req.body.lectureId;
    const success = SocketServer.endLecture(profId, lectureId);
    return success;
  }
}

export default new EndLectureRouter().router;
