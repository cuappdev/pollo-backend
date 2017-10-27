// @flow
import {
  getConnectionManager,
  Repository,
  json
} from 'typeorm';
import {Question} from '../models/Question';
import {QUESTION_TYPE} from '../utils/constants';
import LecturesRepo from './LecturesRepo';

const db = (): Repository<Question> => {
  return getConnectionManager().get().getRepository(Question);
};

// Create a question
const createQuestion = async (text: string, type: QUESTION_TYPE,
  data: json, lectureId: number): Promise<Question> => {
  try {
    const question = new Question();
    question.text = text;
    question.type = type;
    question.data = data;
    question.lecture = await LecturesRepo.getLectureById(lectureId);
    await db().persist(question);
    return question;
  } catch (e) {
    console.log(e);
    throw new Error('Problem creating question!');
  }
};

// Get a question by Id
const getQuestionById = async (id: number): Promise<?Question> => {
  try {
    const question = await db().findOneById(id);
    return question;
  } catch (e) {
    throw new Error(`Problem getting question by id: ${id}!`);
  }
};

// Update a question
const updateQuestionById = async (id: number, text: string, data: json):
Promise<?Question> => {
  try {
    const question = await db().createQueryBuilder('question')
      .leftJoinAndSelect('question.lecture', 'lecture')
      .leftJoinAndSelect('question.responses', 'responses')
      .where('question.id = :id')
      .setParameters({ id: id })
      .getOne();
    question.text = text;
    question.data = data;
    await db().persist(question);
    return question;
  } catch (e) {
    // throw new Error('Error updating response');
    throw new Error(e);
  }
};

// Delete a question by Id
const deleteQuestionById = async (id: number) => {
  try {
    const q = await db().findOneById(id);
    await db().remove(q);
  } catch (e) {
    throw new Error(`Problem deleting question by id: ${id}!`);
  }
};

// Get questions by lecture id
const getQuestionsByLectureId = async (lectureId: number):
Promise<Array<?Question>> => {
  try {
    const questions = await db().createQueryBuilder('questions')
      .innerJoin('questions.lecture', 'lecture', 'lecture.id=:lectureId')
      .setParameters({ lectureId: lectureId })
      .getMany();
    return questions;
  } catch (e) {
    throw new Error('Problem getting questions!');
  }
};

// Returns questions in reverse chronological order starting at the cursor
const paginateQuestionByLectureId = async (lectureId: number, cursor?: number,
  items: number): Promise<Array<?Question>> => {

  if (cursor === undefined) {
    cursor = (new Date()).getTime();
  }

  try {
    const questions = await db().createQueryBuilder('questions')
      .innerJoin('questions.lecture', 'lecture', 'lecture.id=:lectureId')
      .where('questions.createdAt <= :c')
      .setParameters({lectureId: lectureId, c: cursor})
      .orderBy('questions.createdAt', 'DESC')
      .setMaxResults(items)
      .getMany();
    return questions;
  } catch (e) {
    throw new Error('Problem getting questions!');
  }
};

export default {
  createQuestion,
  getQuestionById,
  updateQuestionById,
  deleteQuestionById,
  getQuestionsByLectureId,
  paginateQuestionByLectureId
};
