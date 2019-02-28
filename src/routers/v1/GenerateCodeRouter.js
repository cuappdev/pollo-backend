// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import GroupsRepo from '../../repos/GroupsRepo';
import constants from '../../utils/Constants';

class GenerateCodeRouter extends AppDevRouter<Object> {
    constructor() {
        super(constants.REQUEST_TYPES.GET);
    }

    middleware() {
        return [];
    }

    getPath(): string {
        return '/generate/code/';
    }

    async content(req: Request) {
        return {
            code: GroupsRepo.createCode(),
        };
    }
}

export default new GenerateCodeRouter().router;
