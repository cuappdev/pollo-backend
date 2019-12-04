// @flow
import swaggerUI from 'swagger-ui-express';
import AppDevRouter from '../../utils/AppDevRouter';
import constants from '../../utils/Constants';
import swaggerDocument from './swagger.json';

class DocRouter extends AppDevRouter<Object> {
  constructor() {
    super(constants.REQUEST_TYPES.GET);
  }

  getPath(): string {
    return '/docs/';
  }

  middleware() {
    return [swaggerUI.serve, swaggerUI.setup(swaggerDocument)];
  }

  async content() {
    return {};
  }
}

export default new DocRouter().router;
