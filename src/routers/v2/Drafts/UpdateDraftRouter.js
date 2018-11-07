// @flow
import { Request } from 'express';
import DraftsRepo from '../../../repos/DraftsRepo';
import AppDevRouter from '../../../utils/AppDevRouter';
import constants from '../../../utils/Constants';
import LogUtils from '../../../utils/LogUtils';
import type { APIDraft } from '../APITypes';

class UpdateDraftRouter extends AppDevRouter<Object> {
    constructor() {
        super(constants.REQUEST_TYPES.PUT);
    }

    getPath(): string {
        return '/drafts/:id/';
    }

    async content(req: Request): Promise<{ node: APIDraft }> {
        const draftId = req.params.id;
        const { text, options } = req.body;
        const admin = await DraftsRepo.getOwnerById(draftId);
        if (!admin) throw LogUtils.logError(`Draft with id ${draftId} was not found!`);

        if (!options && !text) {
            throw LogUtils.logError('No fields specified to update.');
        }

        if (admin.id !== req.user.id) {
            throw LogUtils.logError('Not authorized to update draft!');
        }

        const draft = await DraftsRepo.updateDraft(draftId, text, options);
        if (!draft) {
            throw LogUtils.logError(`Draft with id ${draftId} was not found!`);
        }

        return {
            node: {
                id: draft.id,
                text: draft.text,
                options: draft.options,
            },
        };
    }
}

export default new UpdateDraftRouter().router;
