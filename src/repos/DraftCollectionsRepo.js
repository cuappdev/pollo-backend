// @flow
import { getRepository, Repository } from 'typeorm';
import Draft from '../models/Draft';
import User from '../models/User';
import LogUtils from '../utils/LogUtils';
import DraftCollection from '../models/DraftCollection';
import DraftsRepo from './DraftsRepo';

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
  user: User,
): Promise<DraftCollection> => {
  try {
    const draftCollection = new DraftCollection();
    draftCollection.name = name;
    draftCollection.user = user;
    draftCollection.drafts = [];
    await db().save(draftCollection);
    return draftCollection;
  } catch (e) {
    throw LogUtils.logErr('Problem creating draft collection', e, { name, user });
  }
};

/**
 * Gets Draft Collection by UUID
 * @function
 * @param {string} id - UUID of desired collection
 * @return {?DraftCollection} - Draft Collection with the given id
 */
const getDraftCollection = async (id: string): Promise<?DraftCollection> => {
  try {
    let dc = await db().createQueryBuilder('draftcollections')
      .leftJoinAndSelect('draftcollections.user', 'user')
      .leftJoinAndSelect('draftcollections.drafts', 'drafts')
      .leftJoinAndSelect('drafts.user','draftsuser')
      .where('draftcollections.uuid = :draftCollectionID')
      .setParameters({ draftCollectionID: id })
      .orderBy('drafts.position', 'ASC')
      .getOne();
    return dc;
  } catch (e) {
    throw LogUtils.logErr(`Problem getting DraftCollection by UUID: ${id}`, e);
  }
};

/**
 * Gets Draft Collections by user UUID
 * @function
 * @param {string} id - UUID of user
 * @return {DraftCollection[]} - Draft Collections of the user with the given id
 */
const getDraftCollectionsByUser = async (id: string): Promise<Array<DraftCollection>> => {
  try {
    return await db().createQueryBuilder('draftcollections')
      .leftJoinAndSelect('draftcollections.drafts', 'drafts')
      .leftJoinAndSelect('drafts.user','draftsuser')
      .innerJoinAndSelect('draftcollections.user', 'user', 'user.uuid = :userID')
      .setParameters({ userID: id })
      .orderBy('drafts.position', 'ASC')
      .getMany();
  } catch (e) {
    throw LogUtils.logErr(`Problem getting DraftCollections from User with UUID: ${id}`, e);
  }
};

/**
 * Updates Collection by ID
 * @function
 * @param {string} id - UUID of Draft Collection
 * @param {string} name - new name for Draft Collection
 * @return {?DraftCollection} - updated Draft Collection
 */
const updateCollectionNameByID = async (id: string, name: ?string): Promise<?DraftCollection> => {
  try {
    const draftCollection = await getDraftCollection(id);

    if (draftCollection && name) draftCollection.name = name;
    await db().save(draftCollection);
    return draftCollection;
  } catch (e) {
    throw LogUtils.logErr(`Problem updating draft collection by id: ${id}`, e, { name });
  }
};

/**
 * Adds a draft to the collection by UUID at the specified position
 * @function
 * @param {string} id - UUID of Draft Collection
 * @paraam {string} draftID - UUID of draft
 * @param {int} pos - position in the collection to add the draft
 * @return {?DraftCollection} - updated Draft Collection
 */
const addDraftByID = async (id: string, draftID: string, pos: ?number): Promise<?DraftCollection> => {
  try {
    const draftCollection = await getDraftCollection(id);

    if (draftCollection) {
      const draft = await DraftsRepo.getDraft(draftID);
      // only drafts from the same user are allowed to be in a collection
      if (draft
        && draft.user.uuid === draftCollection.user.uuid
        && !(draftCollection.drafts.find(d => d.uuid === draft.uuid))) {
        if (!pos || !Number.isInteger(pos) || pos > draftCollection.drafts.length || pos < 0) {
          draft.position = draftCollection.drafts.length;
          draftCollection.drafts.push(draft);
        } else {
          for (let i = pos; i < draftCollection.drafts.length; i++) {
            draftCollection.drafts[i].position += 1;
          }
          draft.position = pos;
          draftCollection.drafts.push(draft);
        }
      }

      await db().save(draftCollection);
    }

    return draftCollection;
  } catch (e) {
    throw LogUtils.logErr(`Problem adding draft by ID to draft collection: ${id}`, e, { draftID, pos });
  }
};

/**
 * Removes a draft from the collection by UUID
 * @function
 * @param {string} id - UUID of Draft Collection
 * @param {string} draftID - UUID of draft
 * @return {?DraftCollection} - updated Draft Collection
 */
const removeDraftById = async (id: string, draftID: string): Promise<?DraftCollection> => {
  try {
    const draftCollection = await getDraftCollection(id);

    if (draftCollection) {
      const draft = draftCollection.drafts.find((d: Draft) => d.uuid === draftID);
      if (draft) {
        for (let i = draft.position + 1; i < draftCollection.drafts.length; i++) {
          draftCollection.drafts[i].position -= 1;
        }
        draftCollection.drafts[draft.position].position = null;
        await db().save(draftCollection);

        draftCollection.drafts = draftCollection.drafts.filter(d => d.uuid !== draftID);
        await db().save(draftCollection);
      }
    }

    return draftCollection;
  } catch (e) {
    throw LogUtils.logErr(`Problem removing draft by ID from collection: ${id}`, e, { draftID });
  }
};

/**
 * Moves a draft to the specified position by UUID
 * @function
 * @param {string} id - UUID of Draft Collection
 * @param {string} draftID - UUID of draft
 * @param {int} pos - position to move the draft to
 * @return {?DraftCollection} - updated Draft Collection
 */
const moveDraftByID = async (id: string, draftID: string, pos: number): Promise<?DraftCollection> => {
  try {
    await removeDraftById(id, draftID);
    await addDraftByID(id, draftID, pos);
    return getDraftCollection(id);
  } catch (e) {
    throw LogUtils.logErr(`Problem moving draft by ID in collection: ${id}`, e, { draftID, pos });
  }
};

/**
 * Deletes a Draft Collection by id
 * @function
 * @param {string} id - UUID of Draft Collection
 */
const deleteDraftCollectionByID = async (id: string) => {
  try {
    let draftCollection = await getDraftCollection(id);
    if (draftCollection) {
      draftCollection.drafts.splice(0);
      await db().save(draftCollection);
      draftCollection = await getDraftCollection(id);
      await db().remove(draftCollection);
    }
  } catch (e) {
    throw LogUtils.logErr(`Problem removing draft collection: ${id}`, e);
  }
};

/**
 * Deletes a Draft Collection by user id
 * @function
 * @param {string} id - UUID of user whose draft collections we want to delete
 */
const deleteDraftCollectionByUserID = async (id: string) => {
  try {
    const draftCollections = await getDraftCollectionsByUser(id);
    await Promise.all(draftCollections.map(dc => (deleteDraftCollectionByID(dc.uuid))));
  } catch (e) {
    throw LogUtils.logErr(`Problem removing draft collection by user ID: ${id}`, e);
  }
};

/**
 * Gets owner by the Collection's UUID
 * @function
 * @param {string} id - UUID of Draft Collection
 * @return {?User} - User that owns the collection
 */
const getOwnerByID = async (id: string): Promise<?User> => {
  try {
    const draftCollection = await getDraftCollection(id);
    return draftCollection.user;
  } catch (e) {
    throw LogUtils.logErr(`Problem getting owner od collection: ${id}`);
  }
};

export default {
  createDraftCollection,
  getDraftCollection,
  getDraftCollectionsByUser,
  addDraftByID,
  updateCollectionNameByID,
  moveDraftByID,
  removeDraftById,
  deleteDraftCollectionByID,
  deleteDraftCollectionByUserID,
  getOwnerByID,
};
