// @flow
import { getConnectionManager, Repository } from 'typeorm';
import Session from '../models/Session';
import User from '../models/User';
import Question from '../models/Question';

const db = (): Repository<Question> => getConnectionManager().get().getRepository(Question);

// Create a question
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

// Get a question by id
const getQuestionById = async (id: number): Promise<?Question> => {
  try {
    const question = await db().findOneById(id);
    return question;
  } catch (e) {
    throw new Error(`Problem getting question by id: ${id}`);
  }
};

// Delete a question
const deleteQuestionById = async (id: number) => {
  try {
    const question = await db().findOneById(id);
    await db().remove(question);
  } catch (e) {
    throw new Error(`Problem deleting question with id: ${id}`);
  }
};

// Update a question by id
const updateQuestionById = async (id: number, text: string):
  Promise<?Question> => {
  try {
    const field = {};
    if (text) field.text = text;

    await db().createQueryBuilder('questions')
      .where('questions.id = :questionId')
      .setParameters({ questionId: id })
      .update(field)
      .execute();
    return await db().findOneById(id);
  } catch (e) {
    throw new Error(`Problem updating question by id: ${id}`);
  }
};

// Get all questions from a session id
const getQuestionsFromSessionId = async (id: number):
  Promise<Array<?Question>> => {
  try {
    const questions = await db().createQueryBuilder('questions')
      .leftJoinAndSelect('questions.user', 'user')
      .innerJoin('questions.session', 'session', 'session.id = :sessionId')
      .setParameters({ sessionId: id })
      .getMany();
    return questions;
  } catch (e) {
    throw new Error(`Problem getting questions for session with id: ${id}`);
  }
};

// Get a session from a question
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

// Returns true iff the user owns a question by id
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
  isOwnerById
};
