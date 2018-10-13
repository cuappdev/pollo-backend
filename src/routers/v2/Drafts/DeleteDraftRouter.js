// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import DraftsRepo from '../../../repos/DraftsRepo';
import constants from '../../../utils/Constants';

class DeleteDraftRouter extends AppDevRouter<Object> {
    constructor() {
        super(constants.REQUEST_TYPES.DELETE);
    }

    getPath(): string {
        return '/drafts/:id/';
    }

    async content(req: Request) {
        const { id } = req.params;
        const admin = await DraftsRepo.getOwnerById(id);
        if (!admin) throw new Error(`Can't get owner for draft with id ${id}`);
        if (admin.id !== req.user.id) {
            throw new Error('Not authorized to delete draft!');
        }

        await DraftsRepo.deleteDraft(id);
        return null;
    }
}

export default new DeleteDraftRouter().router;
