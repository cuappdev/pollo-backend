// @flow
import {Request} from 'express';
import AppDevRouter from '../utils/AppDevRouter';
import socket from 'socket.io';
import SocketServer from '../SocketServer';
import constants from '../utils/constants';

class JoinLectureRouter extends AppDevRouter {
  constructor () {
    super(constants.REQUEST_TYPES.POST);
  }

  getPath (): string {
    return '/join-lecture/';
  }

  async content (req: Request) {
    // Join specified lecture if allowed
    const studentId = req.body.socketId;
    const lectureId = req.body.lectureId;
    const success = SocketServer.joinLecture(studentId, lectureId);
    return {
      success: success
    };
  }
}

export default new JoinLectureRouter().router;
