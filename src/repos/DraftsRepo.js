// @flow
import { getConnectionManager, Repository } from 'typeorm';
import { User } from '../models/User';
import { Draft } from '../models/Draft';

const db = (): Repository<Draft> => {
  return getConnectionManager().get().getRepository(Draft);
};

// Create a draft
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
    throw new Error('Problem creating draft!');
  }
};

// Get draft by id
const getDraft = async (id: number): Promise<Draft> => {
  try {
    const draft = await db().createQueryBuilder('drafts')
      .leftJoinAndSelect('drafts.user', 'users')
      .where('drafts.id = :draftId')
      .setParameters({ draftId: id })
      .getOne();
    return draft;
  } catch (e) {
    throw new Error(`Problem getting draft with id: ${id}`);
  }
};

// Get drafts by user id
const getDraftsByUser = async (id: number): Promise<Array<?Draft>> => {
  try {
    const drafts = await db().createQueryBuilder('drafts')
      .innerJoinAndSelect('drafts.user', 'user', 'user.id = :userId')
      .setParameters({ userId: id })
      .getMany();
    return drafts;
  } catch (e) {
    throw new Error(`Problem getting drafts for user with id: ${id}`);
  }
};

// Update draft by id
const updateDraft = async (id: number, text: ?string, options: ?string[]):
  Promise<?Draft> => {
  try {
    var field = {};
    if (text) field.text = text;
    if (options) field.options = options;

    await db().createQueryBuilder('drafts')
      .where('drafts.id = :draftId')
      .setParameters({ draftId: id })
      .update(field)
      .execute();
    return await db().findOneById(id);
  } catch (e) {
    throw new Error(`Problem updating draft with id: ${id}`);
  }
};

// Delete draft by id
const deleteDraft = async (id: number) => {
  try {
    const draft = await db().findOneById(id);
    await db().remove(draft);
  } catch (e) {
    throw new Error(`Problem deleting draft with id: ${id}`);
  }
};

// Get owner of draft by id
const getOwnerById = async (id: number): Promise<?User> => {
  try {
    const draft = await db().createQueryBuilder('drafts')
      .leftJoinAndSelect('drafts.user', 'user')
      .where('drafts.id = :draftId')
      .setParameters({ draftId: id })
      .getOne();

    return draft.user;
  } catch (e) {
    throw new Error(`Problem getting owner of draft with id: ${id}`);
  }
};

export default {
  createDraft,
  getDraftsByUser,
  updateDraft,
  deleteDraft,
  getDraft,
  getOwnerById
};
