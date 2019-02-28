// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';
import lib from '../../../utils/Lib';

class RefreshTokenRouter extends AppDevRouter<Object> {
    constructor() {
        super(constants.REQUEST_TYPES.POST);
    }

    getPath(): string {
        return '/auth/refresh/';
    }

    middleware() {
        return [lib.updateSession];
    }

    async content(req: Request) {
        return req.session;
    }
}

export default new RefreshTokenRouter().router;
