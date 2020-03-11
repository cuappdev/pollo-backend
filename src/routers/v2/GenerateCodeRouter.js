// @flow
import GroupsRepo from '../../repos/GroupsRepo';
import AppDevRouter from '../../utils/AppDevRouter';
import constants from '../../utils/Constants';

class GenerateCodeRouter extends AppDevRouter<Object> {
  constructor() {
    super(constants.REQUEST_TYPES.GET);
  }

  // deprecated, do not use
  getPath(): string {
    return '/generate/code/';
  }

  async content() {
    return {
      code: GroupsRepo.createCode(),
    };
  }
}

export default new GenerateCodeRouter().router;
