// @flow
import { getConnectionManager, Repository } from 'typeorm';
import Group from '../models/Group';
import User from '../models/User';
import Question from '../models/Question';
import LogUtils from '../utils/LogUtils';

const db = (): Repository<Question> => getConnectionManager().get().getRepository(Question);

/**
 * Create question and save it to the db
 * @function
 * @param {string} text - Text of question
 * @param {Group} group - Group that question belongs to
 * @param {User} user - User that asked the question
 * @return {Question} New question created
 */
const createQuestion = async (text: string, group: Group, user: User):
  Promise<Question> => {
  try {
    const question = new Question();
    question.text = text;
    question.group = group;
    question.user = user;

    await db().persist(question);
    return question;
  } catch (e) {
    throw LogUtils.logErr('Problem creating question', e, { text, group, user });
  }
};

/**
 * Get a question by UUID
 * @function
 * @param {string} id - UUID of question to fetch
 * @return {?Question} Question with specified UUID
 */
const getQuestionByID = async (id: string): Promise<?Question> => {
  try {
    return await db().createQueryBuilder('questions')
      .where('questions.uuid = :questionID')
      .setParameters({ questionID: id })
      .getOne();
  } catch (e) {
    throw LogUtils.logErr(`Problem getting question by UUID: ${id}`, e);
  }
};

/**
 * Delete a question
 * @function
 * @param {string} id - UUID of question to delete
 */
const deleteQuestionByID = async (id: string) => {
  try {
    const question = await getQuestionByID(id);
    await db().remove(question);
  } catch (e) {
    console.log(e);
    throw LogUtils.logErr(`Problem deleting question by UUID: ${id}`, e);
  }
};

/**
 * Update a question
 * @function
 * @param {string} id - UUID of question to update
 * @param {string} text - New text of question
 * @return {?Question} Updated question
 */
const updateQuestionByID = async (id: string, text: string):
  Promise<?Question> => {
  try {
    const field = {};
    if (text !== undefined && text !== null) {
      field.text = text;
      await db().createQueryBuilder('questions')
        .where('questions.uuid = :questionID')
        .setParameters({ questionID: id })
        .update(field)
        .execute();
    }

    return await getQuestionByID(id);
  } catch (e) {
    throw LogUtils.logErr(`Problem updating question by UUID: ${id}`, e, { text });
  }
};

/**
 * Get group that question belongs to
 * @function
 * @param {string} id - UUID of question we want to get the group for
 * @return {?Group} Group that the question belongs to
 */
const getGroupFromQuestionID = async (id: string) : Promise<?Group> => {
  try {
    const question = await db().createQueryBuilder('questions')
      .leftJoinAndSelect('questions.group', 'group')
      .where('questions.uuid = :questionID', { questionID: id })
      .getOne();
    return question.group;
  } catch (e) {
    throw LogUtils.logErr(`Problem getting group from question by UUID: ${id}`, e);
  }
};

/**
 * Returns if user is the owner of a question
 * @function
 * @param {string} id - UUID of question we want to check the owner of
 * @param {User} user - User that we want to check if they are the owner
 * @return {boolean} Whether the given user is the owner of the question
 */
const isOwnerByID = async (id: string, user: User) : Promise<?boolean> => {
  try {
    const question = await db().createQueryBuilder('questions')
      .leftJoinAndSelect('questions.user', 'user')
      .where('questions.uuid = :questionID', { questionID: id })
      .getOne();

    return user && question.user.id === user.id;
  } catch (e) {
    throw LogUtils.logErr(`Could not verify ownership of question by UUID: ${id}`, e, { user });
  }
};

export default {
  createQuestion,
  deleteQuestionByID,
  getGroupFromQuestionID,
  getQuestionByID,
  isOwnerByID,
  updateQuestionByID,
};
