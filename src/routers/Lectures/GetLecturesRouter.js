// @flow
import AppDevEdgeRouter from '../../utils/AppDevEdgeRouter';
import constants from '../../utils/constants';
import LecturesRepo from '../../repos/LecturesRepo';

import type { APILecture } from '../APITypes';

class GetLecturesRouter extends AppDevEdgeRouter<APILecture> {
  constructor () {
    super(constants.REQUEST_TYPES.GET);
  }

  getPath (): string {
    return '/courses/:id/lectures/';
  }

  async contentArray (req, pageInfo, error) {
    const id = req.params.id;
    const lectures = await LecturesRepo
      .paginateLectureByCourseId(id, pageInfo.cursor, pageInfo.count);

    return lectures
      .filter(Boolean)
      .map(lecture => ({
        node: {
          id: lecture.id,
          dateTime: lecture.dateTime,
        },
        cursor: lecture.createdAt.valueOf(),
      }));
  }
}

export default new GetLecturesRouter().router;
