// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import SessionsRepo from '../../repos/SessionsRepo';
import constants from '../../utils/constants';

class GenerateCodeRouter extends AppDevRouter<Object> {
  constructor() {
    super(constants.REQUEST_TYPES.GET, false);
  }

  getPath(): string {
    return '/generate/code/';
  }

  async content(req: Request) {
    return {
      code: SessionsRepo.createCode()
    };
  }
}

export default new GenerateCodeRouter().router;
