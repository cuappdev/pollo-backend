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

      if (format === undefined || dates === undefined) {
        res.sendStatus(400);
        return;
      }

      const parsedDates = dates.map(Date.parse).map(n => new Date(n));
      let strm;
      switch (format) {
        case constants.EXPORT_FORMATS.CMSX:
          res.type('csv');
          res.set('Content-disposition', `attachment; filename=pollo_group_${id}.csv`);
          strm = await CSVGenerator.participationCMSXPerDay(id, parsedDates);
          strm.pipe(res);
          break;
        case constants.EXPORT_FORMATS.CANVAS:
          res.type('csv');
          res.set('Content-disposition', `attachment; filename=pollo_group_${id}.csv`);
          strm = await CSVGenerator.participationCanvasPerDay(id, parsedDates);
          strm.pipe(res);
          break;
        default:
          res.sendStatus(406);
          break;
      }
    }];
  }
}

export default new GetCSVRouter().router;
