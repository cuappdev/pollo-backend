// @flow
import { Request } from 'express';
import { OAuth2Client } from 'google-auth-library';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';
import LogUtils from '../../../utils/LogUtils';
import UserSessionsRepo from '../../../repos/UserSessionsRepo';

class InitializeSessionRouter extends AppDevRouter<Object> {
    constructor() {
        super(constants.REQUEST_TYPES.POST);
    }

    getPath(): string {
        return '/auth/mobile/';
    }

    middleware() {
        return [];
    }

    async content(req: Request) {
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

        return client
            .verifyIdToken({
                idToken: req.body.idToken,
                aud: process.env.GOOGLE_CLIENT_ID, // audience
            })
            .then(login => UserSessionsRepo.createUserAndInitializeSession(login))
            .catch((error) => {
                LogUtils.logErr(error, null, 'Error authenticating');
            });
    }
}

export default new InitializeSessionRouter().router;
