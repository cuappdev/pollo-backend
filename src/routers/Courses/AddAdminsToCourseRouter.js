// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import CoursesRepo from '../../repos/CoursesRepo';
import constants from '../../utils/constants';

class AddAdminsToCourseRouter extends AppDevRouter {
  constructor () {
    super(constants.REQUEST_TYPES.POST);
  }

  getPath (): string {
    return '/courses/:id/admins/';
  }

  async content (req: Request) {
    const courseId = req.params.id;

    // Admins should follow format [ id, id2, id3 ]
    const admins = req.body.admins;
    if (!admins) throw new Error('Body parameter \'admins\' is missing!');

    if (typeof admins !== 'object') {
      throw new Error('Admins must be a list of admins ids');
    }
    await CoursesRepo.addAdmins(courseId, admins);

    return null;
  }
}

export default new AddAdminsToCourseRouter().router;
