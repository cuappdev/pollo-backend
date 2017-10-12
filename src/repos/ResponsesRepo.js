// @flow
import {
  getConnectionManager,
  Repository,
  json
} from 'typeorm';
import {Response} from '../models/Response';
import {QUESTION_TYPE} from '../utils/constants';
import QuestionsRepo from './QuestionsRepo';
import UsersRepo from './UsersRepo';

const db = (): Repository<Response> => {
  return getConnectionManager().get().getRepository(Response);
};

// Create a response
const createResponse = async (type: QUESTION_TYPE, data: json,
  questionId: number, userId: number): Promise<Response> => {
  try {
    const response = new Response();
    response.type = type;
    response.response = data;
    response.question = await QuestionsRepo.getQuestionById(questionId);
    response.user = await UsersRepo.getUserById(userId);
    await db().persist(response);
    return response;
  } catch (e) {
    console.log(e);
    throw new Error('Problem creating response!');
  }
};

// Get a response by Id
const getResponseById = async (id: number): Promise<?Response> => {
  try {
    const response = await db().findOneById(id);
    return response;
  } catch (e) {
    throw new Error(`Problem getting response by id: ${id}!`);
  }
};

// Get responses by question id
const getResponsesByQuestionId = async (questionId: number):
Promise<Array<?Response>> => {
  try {
    const responses = await db().createQueryBuilder('responses')
      .innerJoin('responses.question', 'question', 'question.id=:questionId')
      .setParameters({ questionId: questionId })
      .getMany();
    return responses;
  } catch (e) {
    throw new Error('Problem getting responses!');
  }
};

// Update a response
const updateResponse = async (id: number, newReponse: json):
Promise<?Response> => {
  try {
    await db().createQueryBuilder('responses')
      .where('responses.id = :id')
      .setParameters({ id: id })
      .update({
        response: newReponse
      })
      .execute();
    return await db().findOneById(id);
  } catch (e) {
    throw new Error('Error updating response');
  }
};

// Returns responses in reverse chronological order starting at the cursor
const paginateResponseByQuestionId = async (questionId: number, cursor: number,
  items: number): Promise<Array<?Response>> => {
  try {
    const responses = await db().createQueryBuilder('responses')
      .innerJoin('responses.question', 'question', 'question.id=:questionId')
      .where('responses.createdAt <= :c')
      .setParameters({questionId: questionId, c: cursor})
      .orderBy('responses.createdAt', 'DESC')
      .setMaxResults(items)
      .getMany();
    return responses;
  } catch (e) {
    throw new Error('Problem getting responses!');
  }
};

export default {
  createResponse,
  getResponseById,
  getResponsesByQuestionId,
  updateResponse,
  paginateResponseByQuestionId
};
