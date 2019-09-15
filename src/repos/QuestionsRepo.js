// @flow
import { getRepository, Repository } from 'typeorm';
import Group from '../models/Group';
import User from '../models/User';
import Question from '../models/Question';
import LogUtils from '../utils/LogUtils';

const db = (): Repository<Question> => getRepository(Question);

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

    await db().save(question);
    return question;
  } catch (e) {
    throw LogUtils.logErr('Problem creating question', e, { text, group, user });
  }
};

/**
 * Get a question by id
 * @function
 * @param {number} id - ID of question to fetch
 * @return {?Question} Question with specified id
 */
const getQuestionByID = async (id: number): Promise<?Question> => {
  try {
    return await db().findOneById(id);
  } catch (e) {
    throw LogUtils.logErr(`Problem getting question by id: ${id}`, e);
  }
};

/**
 * Delete a question
 * @function
 * @param {number} id - ID of question to delete
 */
const deleteQuestionByID = async (id: number) => {
  try {
    const question = await db().findOneById(id);
    await db().remove(question);
  } catch (e) {
    throw LogUtils.logErr(`Problem deleting question by id: ${id}`, e);
  }
};

/**
 * Update a question
 * @function
 * @param {number} id - ID of question to update
 * @param {string} text - New text of question
 * @return {?Question} Updated question
 */
const updateQuestionByID = async (id: number, text: string):
  Promise<?Question> => {
  try {
    const field = {};
    if (text !== undefined && text !== null) {
      field.text = text;
      await db().createQueryBuilder('questions')
        .where('questions.id = :questionID')
        .setParameters({ questionID: id })
        .update(field)
        .execute();
    }

    return await db().findOneById(id);
  } catch (e) {
    throw LogUtils.logErr(`Problem updating question by id: ${id}`, e, { text });
  }
};

/**
 * Get group that question belongs to
 * @function
 * @param {number} id - ID of question we want to get the group for
 * @return {?Group} Group that the question belongs to
 */
const getGroupFromQuestionID = async (id: number) : Promise<?Group> => {
  try {
    const question = await db().createQueryBuilder('questions')
      .leftJoinAndSelect('questions.group', 'group')
      .where('questions.id = :questionID', { questionID: id })
      .getOne();
    return question.group;
  } catch (e) {
    throw LogUtils.logErr(`Problem getting group from question by id: ${id}`, e);
  }
};

/**
 * Returns if user is the owner of a question
 * @function
 * @param {number} id - ID of question we want to check the owner of
 * @param {User} user - User that we want to check if they are the owner
 * @return {boolean} Whether the given user is the owner of the question
 */
const isOwnerByID = async (id: number, user: User) : Promise<?boolean> => {
  try {
    const question = await db().createQueryBuilder('questions')
      .leftJoinAndSelect('questions.user', 'user')
      .where('questions.id = :questionID', { questionID: id })
      .getOne();

    return user && question.user.id === user.id;
  } catch (e) {
    throw LogUtils.logErr(`Could not verify ownership of question by id: ${id}`, e, { user });
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
