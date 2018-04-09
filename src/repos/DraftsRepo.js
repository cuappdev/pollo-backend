// @flow
import { getConnectionManager, Repository, json } from 'typeorm';
import { User } from '../models/User';
import { Draft } from '../models/Draft';

const db = (): Repository<Draft> => {
  return getConnectionManager().get().getRepository(Draft);
};

// Create a draft
const createDraft = async (text: string, options: string[]): Promise<Draft> => {
  try {
    const draft = new Draft();
    draft.text = text;
    draft.options = options;


    await db().persist(draft);
    return draft;
  } catch (e) {
    throw new Error('Problem creating poll!');
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
}

export default {
  createDraft,
  getDraftsByUser
};
