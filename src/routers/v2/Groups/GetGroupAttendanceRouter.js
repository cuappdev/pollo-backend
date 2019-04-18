// @flow
// import { Request } from 'express';
import {
  NextFunction,
  Request,
  Response,
} from 'express';
import AppDevResponse from '../../../utils/AppDevResponse';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';
import LogUtils from '../../../utils/LogUtils';
// import GroupsRepo from '../../../repos/GroupsRepo';

class GetGroupAttendanceRouter extends AppDevRouter<Object> {
  constructor() {
    super(constants.REQUEST_TYPES.GET);
  }

  getPath(): string {
    // return '/sessions/:id/attendance/';
    return '/attendance/';
  }

  newResponse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // const { id } = req.params;
      // const isAdmin = await GroupsRepo.isAdmin(id, req.user);
      const isAdmin = true;

      if (isAdmin) {
        res.sendFile('test.csv', { root: __dirname });
      } else {
        res.send(
          new AppDevResponse(
            false,
            { errors: ['Non-admins of group cannot send file'] },
          ),
        );
      }
    } catch (e) {
      if (e.message === 1) {
        throw LogUtils.logErr('You must implement content()');
      } else {
        res.json(new AppDevResponse(false, { errors: [e.message] }));
      }
    }
  }

  response(): (req: Request, res: Response, next: NextFunction) => Promise<void> {
    return this.newResponse;
  }
}

export default new GetGroupAttendanceRouter().router;
