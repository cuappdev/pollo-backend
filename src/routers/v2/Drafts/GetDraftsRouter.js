// @flow
import AppDevEdgeRouter from '../../../utils/AppDevEdgeRouter';
import DraftsRepo from '../../../repos/DraftsRepo';
import constants from '../../../utils/constants';
import type { APIDraft } from '../APITypes';

class GetDraftsRouter extends AppDevEdgeRouter<APIDraft> {
    constructor() {
        super(constants.REQUEST_TYPES.GET);
    }

    getPath(): string {
        return '/drafts/';
    }

    async contentArray(req) {
        const drafts = await DraftsRepo.getDraftsByUser(req.user.id);

        return drafts
            .filter(Boolean)
            .map(draft => ({
                node: {
                    id: draft.id,
                    text: draft.text,
                    options: draft.options,
                },
                cursor: draft.createdAt.valueOf(),
            }));
    }
}

export default new GetDraftsRouter().router;
