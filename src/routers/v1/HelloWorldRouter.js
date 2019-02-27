// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import constants from '../../utils/Constants';

class HelloWorldRouter extends AppDevRouter<Object> {
    constructor() {
        super(constants.REQUEST_TYPES.GET);
    }

    middleware() {
        return [];
    }

    getPath(): string {
        return '/hello/';
    }

    async content(req: Request) {
        return { message: 'Hello, world!' };
    }
}

export default new HelloWorldRouter().router;
