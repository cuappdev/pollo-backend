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
      polls
        // .filter((poll: ?Poll): boolean => poll != null)
        .forEach((poll: Poll) => {
          Object.entries(poll.answers).forEach(([key: string, value: PollChoice[]]) => {
            if (!Object.prototype.hasOwnProperty.call(userResponses, key)) userResponses[key] = Array(5).fill('none');
            while (userResponses[key].length < headers.length) userResponses[key].push('none');
            userResponses[key].push(value[0].letter);
          });
          headers.push(poll.text);
        });
      Object.values(userResponses).forEach((arr) => {
        while (arr.length < headers.length) arr.push('none');
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
