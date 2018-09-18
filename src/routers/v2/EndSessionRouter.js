// @flow
import { Request } from 'express';
import AppDevRouter from '../../utils/AppDevRouter';
import constants from '../../utils/constants';
import SessionsRepo from '../../repos/SessionsRepo';

class EndSessionRouter extends AppDevRouter<Object> {
    constructor() {
        super(constants.REQUEST_TYPES.POST);
    }

    getPath(): string {
        return '/sessions/:id/end/';
    }

    async content(req: Request) {
        const { id, save } = req.params;

        const session = await SessionsRepo.getSessionById(id);
        if (!session) {
            throw new Error(`No session with id ${id} found.`);
        }

        if (!(await SessionsRepo.isAdmin(id, req.user))) {
            throw new Error('Not authorized to end session.');
        }

        if (save === 'false' || save === '0') {
            await SessionsRepo.deleteSessionById(id);
        }

        await req.app.sessionManager.endSession(session, save);

        return null;
    }
}

export default new EndSessionRouter().router;