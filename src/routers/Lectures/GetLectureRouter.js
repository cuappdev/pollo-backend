// @flow
import AppDevNodeRouter from '../../utils/AppDevNodeRouter';
import LecturesRepo from '../../repos/LecturesRepo';

import type { APILecture } from '../APITypes';

class GetLecture extends AppDevNodeRouter<APILecture> {
  getPath (): string {
    return '/lectures/:id/';
  }

  async fetchWithId (id: number) {
    const lecture = await LecturesRepo.getLectureById(id);
    return lecture && {
      id: lecture.id,
      dateTime: lecture.dateTime,
    };
  }
}

export default new GetLecture().router;
