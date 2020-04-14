// @flow
import { getRepository, Repository } from 'typeorm';
import Draft from '../models/Draft';
import User from '../models/User';
import LogUtils from '../utils/LogUtils';
import DraftCollection from '../models/DraftCollection';

const db = (): Repository<DraftCollection> => getRepository(DraftCollection);

/**
 * Creates a Draft Collection and saves it to the db
 * @function
 * @param {string} name - Name of collection
 * @param {User} user - User trying to create the collection
 * @return {DraftCollection} - Newly created Draft Collection
 */
const createDraftCollection = async (
  name: string,
  user: User
): Promise<DraftCollection> => {
  try {
    const draftCollection = new DraftCollection();
    draftCollection.name = name;
    draftCollection.user = user;
    await db().save(draftCollection);
    return draftCollection;
  } catch (e) {
    throw LogUtils.logErr('Problem creating draft collection', e, {name, user});
  }
};

/**
 * Gets Draft Collection by uuid
 * @function
 * @param {string} id - UUID of desired collection
 * @return {DraftCollection} - Draft Collection with the given id
 */
const getDraftCollection = async (id: string): Promise<DraftCollection> => {
  try {
    return await db()
      .createQueryBuilder('draftcollections')
      .where('draftcollections.uuid = :draftCollectionID')
      .setParameter({ draftCollectionID: id })
      .getOne();
  } catch (e) {
    throw LogUtils.logErr(`Problem getting DraftCollection by UUID: ${id}`, e);
  }
};

export default {
  createDraftCollection,
  getDraftCollection,
};
