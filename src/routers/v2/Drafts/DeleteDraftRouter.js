// @flow
import { Request } from 'express';
import AppDevRouter from '../../../utils/AppDevRouter';
import DraftsRepo from '../../../repos/DraftsRepo';
import constants from '../../../utils/Constants';
import LogUtils from '../../../utils/LogUtils';

class DeleteDraftRouter extends AppDevRouter<Object> {
    constructor() {
        super(constants.REQUEST_TYPES.DELETE);
    }

    getPath(): string {
        return '/drafts/:id/';
    }

    async content(req: Request) {
        const { id } = req.params;
        const admin = await DraftsRepo.getOwnerByID(id);
        if (!admin) throw LogUtils.logErr({ message: `Can't get owner for draft by id: ${id}` });
        if (admin.id !== req.user.id) {
            throw LogUtils.logErr({},
                { admin: admin.id, id: req.user.id }, 'Not authorized to delete draft');
        }

        await DraftsRepo.deleteDraft(id);
        return null;
    }
}

export default new DeleteDraftRouter().router;
