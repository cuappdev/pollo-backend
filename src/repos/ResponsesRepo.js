// @flow
import {
  getConnectionManager,
  Repository,
  json
} from 'typeorm';
import {Response} from '../models/Response';
import QuestionsRepo from './QuestionsRepo';
import UsersRepo from './UsersRepo';

const db = (): Repository<Response> => {
  return getConnectionManager().get().getRepository(Response);
};

// Create a response
const createResponse = async (data: json,
  questionId: number, userId: number): Promise<Response> => {
  try {
    const response = new Response();
    response.response = data;
    var question = await QuestionsRepo.getQuestionById(questionId);
    if (question) {
      response.question = question;
      response.type = question.type;
    }
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
const updateResponse = async (id: number, newResponse: json):
Promise<?Response> => {
  try {
    const response = await db().createQueryBuilder('response')
      .leftJoinAndSelect('response.question', 'question')
      .leftJoinAndSelect('response.user', 'user')
      .where('response.id = :id')
      .setParameters({ id: id })
      .getOne();
    response.response = newResponse;
    await db().persist(response);
    return response;
  } catch (e) {
    throw new Error('Error updating response');
  }
};

// Get response if user already answered question
const existingResponse = async (userId: number, questionId: number):
Promise<?Response> => {
  try {
    const response = await db().createQueryBuilder('response')
      .innerJoin('response.question', 'question', 'question.id=:questionId')
      .innerJoin('response.user', 'user', 'user.id=:userId')
      .setParameters({ questionId: questionId, userId: userId })
      .getOne();
    return response;
  } catch (e) {
    return null;
  }
};

// Delete a response by Id
const deleteResponseById = async (id: number) => {
  try {
    const r = await db().findOneById(id);
    await db().remove(r);
  } catch (e) {
    throw new Error(`Problem deleting response by id: ${id}!`);
  }
};

// Returns responses in reverse chronological order starting at the cursor
const paginateResponseByQuestionId = async (questionId: number, cursor?: number,
  items: number): Promise<Array<?Response>> => {
  if (cursor === undefined) {
    cursor = (new Date()).getTime();
  }

  try {
    const responses = await db().createQueryBuilder('responses')
      .leftJoinAndSelect('responses.user', 'user')
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
  existingResponse,
  deleteResponseById,
  paginateResponseByQuestionId
};
