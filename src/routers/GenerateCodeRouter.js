// @flow
import AppDevRouter from '../utils/AppDevRouter';
import SessionsRepo from '../repos/SessionsRepo';
import constants from '../utils/constants';
import {Request} from 'express';

class GenerateCodeRouter extends AppDevRouter<Object> {
  constructor () {
    super(constants.REQUEST_TYPES.GET);
  }

  getPath (): string {
    return '/generate/code/';
  }

  async content (req: Request) {
    return {
      code: SessionsRepo.createCode()
    };
  }
}

export default new GenerateCodeRouter().router;
