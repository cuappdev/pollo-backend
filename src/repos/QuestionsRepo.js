// @flow
import { getConnectionManager, Repository, json } from 'typeorm';
import { Poll } from '../models/Poll';
import { Question } from '../models/Question';

const db = (): Repository<Question> => {
  return getConnectionManager().get().getRepository(Question);
};

// Create a question
const createQuestion = async (text: string, poll: Poll, results: json):
  Promise <Question> => {
  try {
    const question = new Question();
    question.text = text;
    question.poll = poll;
    question.results = results;

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
    throw new Error(`Problem getting question by id: ${id}!`);
  }
};

// Delete a question
const deleteQuestionById = async (id: number) => {
  try {
    const question = await db().findOneById(id);
    await db().remove(question);
  } catch (e) {
    throw new Error(`Problem deleting question with id: ${id}!`);
  }
};

const updateQuestionById = async (id: number, text: ?string):
  Promise<?Question> => {
    try {
      var field = {};
      if (name) field.text = text;
      await db().createQueryBuilder('questions')
        .where('questions.id = :questionId')
        .setParameters({ questionId: id })
        .update(field)
        .execute();
      return await db().findOneById(id);
    } catch (e) {
      throw new Error(`Problem updating question by id: ${id}!`);
    }
  }

export default {
  createQuestion,
  deleteQuestionById,
  getQuestionById,
  updateQuestionById
};
