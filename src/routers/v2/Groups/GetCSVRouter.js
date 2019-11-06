// @flow
import {
  NextFunction,
  Request,
  Response,
} from 'express';
import stream from 'stream';

import Poll from '../../../models/Poll';
import User from '../../../models/User';
import GroupsRepo from '../../../repos/GroupsRepo';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';
import type { ExpressCallback } from '../../../utils/AppDevRouter';

class GetCSVRouter extends AppDevRouter {
  constructor() {
    super(constants.REQUEST_TYPES.GET);
  }

  getPath(): string {
    return '/sessions/:id/csv/';
  }

  middleware(): ExpressCallback[] {
    return [super.middleware(), async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const polls: Array<?Poll> = await GroupsRepo.getPolls(id);
      const headers: Array<string> = [];
      const userResponses: Map<User, Array<string>> = new Map();
      const users: Array<User> = await GroupsRepo.getUsersByGroupID(id, constants.USER_TYPES.MEMBER);
      users.forEach((user: User) => {
        userResponses.set(user, []);
      });

      polls.forEach((poll: Poll) => {
        userResponses.forEach((answers: Array<string>, user: User, ) => {
          if (Object.prototype.hasOwnProperty.call(poll.answers, user.googleID)) {
            answers.push(poll.answers[user.googleID][0].letter);
          } else {
            answers.push('');
          }
        });
        headers.push(poll.text);
      });

      res.type('csv');
      res.set('Content-disposition', `attachment; filename=pollo_group_${id}.csv`);

      const s = new stream.PassThrough();
      s.write(`userid,${headers.join(',')}\n`);
      userResponses.forEach((response: Array<string>, user: User) => {
        s.write(`${user.netID},${response.join(',')}\n`);
      });
      s.end();

      s.pipe(res);
    }];
  }
}

export default new GetCSVRouter().router;
