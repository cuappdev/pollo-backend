// @flow
import { getConnectionManager, Repository, json, leftJoinAndSelect } from 'typeorm';
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

// Update a question by id
const updateQuestionById = async (id: number, text: ?string, results: ?json):
  Promise<?Question> => {
  try {
    var field = {};
    if (text) field.text = text;
    if (results) field.results = results;

    await db().createQueryBuilder('questions')
      .where('questions.id = :questionId')
      .setParameters({ questionId: id })
      .update(field)
      .execute();
    return await db().findOneById(id);
  } catch (e) {
    console.log(e);
    throw new Error(`Problem updating question by id: ${id}!`);
  }
};

// Get questions from a poll id
const getQuestionsFromPollId = async (id: number):
  Promise<Array<?Question>> => {
  try {
    const questions = await db().createQueryBuilder('questions')
      .innerJoin('questions.poll', 'poll', 'poll.id = :pollId')
      .setParameters({ pollId: id })
      .getMany();
    return questions;
  } catch (e) {
    throw new Error(`Problem getting questions for poll with id: ${id}!`);
  }
};

// Delete questions where question.poll = null, typeorm's cascade doesn't work
const deleteQuestionsWithoutPoll = async () => {
  try {
    await db().createQueryBuilder('questions')
      .delete()
      .where('questions.poll is NULL')
      .execute();
  } catch (e) {
    throw new Error('Problem removing questions with no poll reference.');
  }
};

// Get a poll from question
const getPollFromQuestionId = async (id: number) : Promise<?Poll> => {
  try {
    const question = await db().createQueryBuilder('questions')
      .leftJoinAndSelect('questions.poll', 'poll')
      .where('questions.id = :questionId', {questionId: id})
      .getOne();
    return question.poll;
  } catch (e) {
    throw new Error(`Problem getting poll from quesiton with id: ${id}!`);
  }
};

export default {
  createQuestion,
  deleteQuestionById,
  getQuestionById,
  updateQuestionById,
  getQuestionsFromPollId,
  deleteQuestionsWithoutPoll,
  getPollFromQuestionId
};
