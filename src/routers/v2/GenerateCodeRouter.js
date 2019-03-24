// @flow
import AppDevRouter from '../../utils/AppDevRouter';
import constants from '../../utils/Constants';
import GroupsRepo from '../../repos/GroupsRepo';

class GenerateCodeRouter extends AppDevRouter<Object> {
  constructor() {
    super(constants.REQUEST_TYPES.GET);
  }

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
