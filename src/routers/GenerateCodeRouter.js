// @flow
import AppDevRouter from '../utils/AppDevRouter';
import PollsRepo from '../repos/PollsRepo';
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
      code: PollsRepo.createCode()
    };
  }
}

export default new GenerateCodeRouter().router;
