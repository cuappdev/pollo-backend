// @flow
import { getConnectionManager, Repository } from 'typeorm';
import Draft from '../models/Draft';
import LogUtils from '../utils/LogUtils';
import User from '../models/User';

const db = (): Repository<Draft> => getConnectionManager().get().getRepository(Draft);

/**
* Creates a draft and saves it to the db
* @function
* @param {string} text - Text of question
* @param {string[]} options - Options of question
* @param {User} user - User that wants to create draft
* @return {Draft} new created draft
*/
const createDraft = async (text: string, options: string[], user: User):
  Promise<Draft> => {
    try {
        const draft = new Draft();
        draft.text = text;
        draft.options = options;
        draft.user = user;

        await db().persist(draft);
        return draft;
    } catch (e) {
        throw LogUtils.logError('Problem creating draft!');
    }
};

/**
* Gets draft by id
* @function
* @param {number} id - ID of draft we want to fetch
* @return {Draft} Draft with given id
*/
const getDraft = async (id: number): Promise<Draft> => {
    try {
        return await db().createQueryBuilder('drafts')
            .leftJoinAndSelect('drafts.user', 'users')
            .where('drafts.id = :draftID')
            .setParameters({ draftID: id })
            .getOne();
    } catch (e) {
        throw LogUtils.logError(`Problem getting draft with id: ${id}`);
    }
};

/**
* Gets draft by user id
* @function
* @param {number} id - ID of user we want to fetch drafts for
* @return {Draft[]} Drafts belonging to the user specified
*/
const getDraftsByUser = async (id: number): Promise<Array<?Draft>> => {
    try {
        return await db().createQueryBuilder('drafts')
            .innerJoinAndSelect('drafts.user', 'user', 'user.id = :userID')
            .setParameters({ userID: id })
            .getMany();
    } catch (e) {
        throw LogUtils.logError(`Problem getting drafts for user with id: ${id}`);
    }
};

/**
* Updates draft
* @function
* @param {number} id - ID of draft to update
* @param {string} [text] - New text of draft
* @param {string[]} [options] - New options of draft
* @return {?Draft} Updated draft
*/
const updateDraft = async (id: number, text: ?string, options: ?string[]):
  Promise<?Draft> => {
    try {
        const draft = await db().createQueryBuilder('drafts')
            .leftJoinAndSelect('drafts.user', 'user')
            .where('drafts.id = :draftID')
            .setParameters({ draftID: id })
            .getOne();

        if (options) draft.options = options;
        if (text !== undefined && text !== null) draft.text = text;

        await db().persist(draft);
        return draft;
    } catch (e) {
        throw LogUtils.logError(`Problem updating draft with id: ${id}`);
    }
};

/**
* Deletes draft
* @function
* @param {number} id - ID of draft to delete
*/
const deleteDraft = async (id: number) => {
    try {
        const draft = await db().findOneById(id);
        await db().remove(draft);
    } catch (e) {
        throw LogUtils.logError(`Problem deleting draft with id: ${id}`);
    }
};

/**
* Get owner of a draft
* @function
* @param {number} id - ID of draft to get owner of
* @return {?User} owner of draft
*/
const getOwnerByID = async (id: number): Promise<?User> => {
    try {
        const draft = await db().createQueryBuilder('drafts')
            .leftJoinAndSelect('drafts.user', 'user')
            .where('drafts.id = :draftID')
            .setParameters({ draftID: id })
            .getOne();

        return draft.user;
    } catch (e) {
        throw LogUtils.logError(`Problem getting owner of draft with id: ${id}`);
    }
};

export default {
    createDraft,
    getDraftsByUser,
    updateDraft,
    deleteDraft,
    getDraft,
    getOwnerByID,
};
