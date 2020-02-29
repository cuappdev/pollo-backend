// @flow
import {
  NextFunction,
  Request,
  Response,
} from 'express';

import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';
import type { ExpressCallback } from '../../../utils/AppDevRouter';
import CSVGenerator from '../CSVGenerator';

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
      const { format, dates } = req.query;
      const parsedDates = dates.map(Date.parse).map(n => new Date(n));
      let s;
      switch (format) {
        case constants.EXPORT_FORMATS.CMSX:
          s = await CSVGenerator.participationCMSX(id, parsedDates);
          s.pipe(res);
          break;
        case constants.EXPORT_FORMATS.CANVAS:
          res.status(501);
          res.send('Canvas not yet supported');
          break;
        default:
          res.sendStatus(406);
          break;
      }
    }];
  }
}

export default new GetCSVRouter().router;
