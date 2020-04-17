// @flow
import { getRepository, Repository } from 'typeorm';
import Draft from '../models/Draft';
import User from '../models/User';
import LogUtils from '../utils/LogUtils';

const db = (): Repository<Draft> => getRepository(Draft);

/**
 * Creates a draft and saves it to the db
 * @function
 * @param {string} text - Text of question
 * @param {string[]} options - Options of question
 * @param {User} user - User that wants to create draft
 * @return {Draft} new created draft
 */
const createDraft = async (
  text: string,
  options: string[],
  user: User,
): Promise<Draft> => {
  try {
    const draft = new Draft();
    draft.text = text;
    draft.options = options;
    draft.user = user;
    await db().save(draft);
    return draft;
  } catch (e) {
    throw LogUtils.logErr('Problem creating draft', e, { text, options, user });
  }
};

/**
* Gets draft by UUID
* @function
* @param {string} id - UUID of draft we want to fetch
* @return {Draft} Draft with given UUID
*/
const getDraft = async (id: string): Promise<Draft> => {
  try {
    return await db().createQueryBuilder('drafts')
      .leftJoinAndSelect('drafts.user', 'users')
      .where('drafts.uuid = :draftID')
      .setParameters({ draftID: id })
      .getOne();
  } catch (e) {
    throw LogUtils.logErr(`Problem getting draft by UUID: ${id}`, e);
  }
};

/**
* Gets draft by user UUID
* @function
* @param {string} id - UUID of user we want to fetch drafts for
* @return {Draft[]} Drafts belonging to the user specified
*/
const getDraftsByUser = async (id: string): Promise<Array<?Draft>> => {
  try {
    return await db().createQueryBuilder('drafts')
      .innerJoinAndSelect('drafts.user', 'user', 'user.uuid = :userID')
      .setParameters({ userID: id })
      .getMany();
  } catch (e) {
    throw LogUtils.logErr(`Problem getting drafts for user by UUID: ${id}`, e);
  }
};

/**
* Updates draft
* @function
* @param {string} id - UUID of draft to update
* @param {string} [text] - New text of draft
* @param {string[]} [options] - New options of draft
* @return {?Draft} Updated draft
*/
const updateDraft = async (id: string, text: ?string, options: ?string[]):
  Promise<?Draft> => {
  try {
    const draft = await db().createQueryBuilder('drafts')
      .leftJoinAndSelect('drafts.user', 'user')
      .where('drafts.uuid = :draftID')
      .setParameters({ draftID: id })
      .getOne();
    if (options) draft.options = options;
    if (text !== undefined && text !== null) draft.text = text;
    await db().save(draft);
    return draft;
  } catch (e) {
    throw LogUtils.logErr(`Problem updating draft by UUID: ${id}`, e);
  }
};

/**
* Deletes draft
* @function
* @param {string} id - UUID of draft to delete
*/
const deleteDraft = async (id: string) => {
  try {
    const draft = await db().createQueryBuilder('drafts')
      .where('drafts.uuid = :draftID')
      .setParameters({ draftID: id })
      .getOne();
    await db().remove(draft);
  } catch (e) {
    throw LogUtils.logErr(`Problem deleting draft by UUID: ${id}`, e);
  }
};

/**
 * Deletes all drafts owned by a certain user
 * @function
 * @param {string} id - UUID of user we want to delete drafts for
 */
const deleteDraftsByUserID = async (id: string) => {
  try {
    const drafts = await getDraftsByUser(id);
    await Promise.all(drafts.map(async d => (deleteDraft(d.uuid))));
  } catch (e) {
    throw LogUtils.logErr('Problem deleting all drafts by User ID', { id });
  }
};

/**
* Get owner of a draft
* @function
* @param {string} id - UUID of draft to get owner of
* @return {?User} owner of draft
*/
const getOwnerByID = async (id: string): Promise<?User> => {
  try {
    const draft = await db().createQueryBuilder('drafts')
      .leftJoinAndSelect('drafts.user', 'user')
      .where('drafts.uuid = :draftID')
      .setParameters({ draftID: id })
      .getOne();
    return draft.user;
  } catch (e) {
    throw LogUtils.logErr(`Problem getting owner of draft by UUID: ${id}`, e);
  }
};

export default {
  createDraft,
  getDraftsByUser,
  updateDraft,
  deleteDraft,
  deleteDraftsByUserID,
  getDraft,
  getOwnerByID,
};
