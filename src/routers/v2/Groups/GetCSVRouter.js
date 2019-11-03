// @flow

import stream from 'stream';
import {
  NextFunction,
  Request,
  Response,
} from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';
import GroupsRepo from '../../../repos/GroupsRepo';
import type { ExpressCallback } from '../../../utils/AppDevRouter';
import Poll from '../../../models/Poll';
import type { PollChoice } from '../../../models/Poll';
import UsersRepo from '../../../repos/UsersRepo';
import User from '../../../models/User';

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
      const userResponses: { string: Array<string> } = {};
      const users: Array<User> = await GroupsRepo.getUsersByGroupID(id, constants.USER_TYPES.MEMBER);
      users.forEach((user: User) => {
        userResponses[user.googleID] = [];
      });

      polls
        .forEach((poll: Poll) => {
          Object.entries(userResponses).forEach(([user: string, answers: Array<string>]) => {
            if (Object.prototype.hasOwnProperty.call(poll.answers, user)) {
              answers.push(poll.answers[user][0].letter);
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
      Object.entries(userResponses).forEach(([user: string, response: Array<string>]) => {
        s.write(`${user},${response.join(',')}\n`);
      });
      s.end();

      s.pipe(res);
    }];
  }
}

export default new GetCSVRouter().router;
