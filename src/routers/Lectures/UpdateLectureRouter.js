// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import LecturesRepo from '../../repos/LecturesRepo';
import constants from '../../utils/constants';

class UpdateLectureRouter extends AppDevRouter<Object> {
  constructor () {
    super(constants.REQUEST_TYPES.PUT);
  }

  getPath (): string {
    return '/lectures/:id/';
  }

  async content (req: Request) {
    const lecId = req.params.id;
    const dateTime = req.body.dateTime;
    if (!dateTime) throw new Error('dateTime missing');

    const lec = await LecturesRepo.updateLectureById(lecId, dateTime);
    if (!lec) throw new Error(`Lecture with id ${lecId} not found!`);
    return {
      node: {
        id: String(lec.id),
        dateTime: dateTime
      }
    };
  }
}

export default new UpdateLectureRouter().router;
