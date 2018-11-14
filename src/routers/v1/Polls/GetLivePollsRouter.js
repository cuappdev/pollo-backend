// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';

class GetLivePollsRouter extends AppDevRouter<Object> {
    constructor() {
        super(constants.REQUEST_TYPES.POST, false);
    }

    getPath(): string {
        return '/polls/live/';
    }

    async content(req: Request) {
        const { codes } = req.body;

        if (!codes) throw new Error('Poll codes are missing!');

        const polls = await req.app.groupManager.liveGroups(codes);
        return polls
            .filter(Boolean)
            .map(poll => ({
                node: {
                    id: poll.id,
                    name: poll.name,
                    code: poll.code,
                },
            }));
    }
}

export default new GetLivePollsRouter().router;
