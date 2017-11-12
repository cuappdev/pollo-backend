// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import LecturesRepo from '../../repos/LecturesRepo';
import LectureManager from '../../LectureManager';
import constants from '../../utils/constants';

/**
 * In theory this router should be temporary
 * though this is till tbd.
 * ask @mrkev for more info.
 */
class LecturePortsRouter extends AppDevRouter {
  constructor () {
    super(constants.REQUEST_TYPES.GET);
  }

  getPath (): string {
    return '/lectures/:id/ports/';
  }

  async content (req: Request) {
    const lectureId = parseInt(req.params.id);
    if (Number.isNaN(lectureId)) {
      throw new Error(`Invalid lecture id ${req.params.id}`);
    }
    const ports = LectureManager.portsForLecture(lectureId);
    return {
      ports
    };
  }
}

export default new LecturePortsRouter().router;
