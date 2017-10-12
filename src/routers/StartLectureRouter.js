// @flow
import {Request} from 'express';
import AppDevRouter from '../utils/AppDevRouter';
import socket from 'socket.io';
import SocketServer from '../SocketServer';
import constants from '../utils/constants';

class StartLectureRouter extends AppDevRouter {
  constructor () {
    super(constants.REQUEST_TYPES.POST);
  }

  getPath (): string {
    return '/start-lecture/';
  }

  _generateLectureId (courseId: string, date: string): string {
    // TODO - Generate unique lecture ID given the course ID and the date
    // Date format is as follows: "Fri Sep 15 2017"
    return courseId.replace(/\s/g, '') + date.replace(/\s/g, '');
  }

  async content (req: Request) {
    // Start socket with namespace of lecture id
    const profId = req.body.socketId;
    const courseId = req.body.courseId;
    const date = req.body.date;
    const lectureId = this._generateLectureId(courseId, date);
    const success = SocketServer.startLecture(profId, lectureId);
    return {
      success: success,
      lectureId: lectureId
    };
  }
}

export default new StartLectureRouter().router;
