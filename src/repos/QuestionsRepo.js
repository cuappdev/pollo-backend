// @flow
import { getConnectionManager, Repository } from 'typeorm';
import Session from '../models/Session';
import User from '../models/User';
import Question from '../models/Question';

const db = (): Repository<Question> => getConnectionManager().get().getRepository(Question);

/**
 * Create question and save it to the db
 * @function
 * @param {string} text - Text of question
 * @param {Session} session - Session that question belongs to
 * @param {User} user - User that asked the question
 * @return {Question} New question created
 */
const createQuestion = async (text: string, session: Session, user: User):
  Promise<Question> => {
    try {
        const question = new Question();
        question.text = text;
        question.session = session;
        question.user = user;

        await db().persist(question);
        return question;
    } catch (e) {
        throw new Error('Problem creating question!');
    }
};

/**
 * Get a question by id
 * @function
 * @param {number} id - Id of question to fetch
 * @return {?Question} Question with specified id
 */
const getQuestionById = async (id: number): Promise<?Question> => {
    try {
        return await db().findOneById(id);
    } catch (e) {
        throw new Error(`Problem getting question by id: ${id}`);
    }
};

/**
 * Delete a question
 * @function
 * @param {number} id - Id of question to delete
 */
const deleteQuestionById = async (id: number) => {
    try {
        const question = await db().findOneById(id);
        await db().remove(question);
    } catch (e) {
        throw new Error(`Problem deleting question with id: ${id}`);
    }
};

/**
 * Update a question
 * @function
 * @param {number} id - Id of question to update
 * @param {string} text - New text of question
 * @return {?Question} Updated question
 */
const updateQuestionById = async (id: number, text: string):
  Promise<?Question> => {
    try {
        const field = {};
        if (text !== undefined && text !== null) {
            field.text = text;
            await db().createQueryBuilder('questions')
                .where('questions.id = :questionId')
                .setParameters({ questionId: id })
                .update(field)
                .execute();
        }

        return await db().findOneById(id);
    } catch (e) {
        throw new Error(`Problem updating question by id: ${id}`);
    }
};

/**
 * Get all questions for a session
 * @function
 * @param {number} id - Id of session we want to get questions for
 * @reutrn {Question[]} List of questions from specified session
 */
const getQuestionsFromSessionId = async (id: number):
  Promise<Array<?Question>> => {
    try {
        return await db().createQueryBuilder('questions')
            .leftJoinAndSelect('questions.user', 'user')
            .innerJoin('questions.session', 'session', 'session.id = :sessionId')
            .setParameters({ sessionId: id })
            .getMany();
    } catch (e) {
        throw new Error(`Problem getting questions for session with id: ${id}`);
    }
};

/**
 * Get session that question belongs to
 * @function
 * @param {number} id - Id of question we want to get the session for
 * @return {?Session} Session that the question belongs to
 */
const getSessionFromQuestionId = async (id: number) : Promise<?Session> => {
    try {
        const question = await db().createQueryBuilder('questions')
            .leftJoinAndSelect('questions.session', 'session')
            .where('questions.id = :questionId', { questionId: id })
            .getOne();
        return question.session;
    } catch (e) {
        throw new Error(`Problem getting session from question with id: ${id}`);
    }
};

/**
 * Returns if user is the owner of a question
 * @function
 * @param {number} id - Id of question we want to check the owner of
 * @param {User} user - User that we want to check if they are the owner
 * @return {boolean} Whether the given user is the owner of the question
 */
const isOwnerById = async (id: number, user: User) : Promise<?boolean> => {
    try {
        const question = await db().createQueryBuilder('questions')
            .leftJoinAndSelect('questions.user', 'user')
            .where('questions.id = :questionId', { questionId: id })
            .getOne();

        return user && question.user.id === user.id;
    } catch (e) {
        throw new Error(`Could not verify ownership of question with id: ${id}`);
    }
};

export default {
    createQuestion,
    deleteQuestionById,
    getQuestionById,
    updateQuestionById,
    getQuestionsFromSessionId,
    getSessionFromQuestionId,
    isOwnerById,
};
