// @flow
import { getConnectionManager, Repository } from 'typeorm';
import {Lecture} from '../models/Lecture';
import CoursesRepo from './CoursesRepo';

const db = (): Repository<Lecture> => {
  return getConnectionManager().get().getRepository(Lecture);
};

// Create a lecture
const createLecture = async (datetime: number, courseId: number):
Promise<Lecture> => {
  try {
    const lecture = new Lecture();
    lecture.dateTime = datetime;
    lecture.course = await CoursesRepo.getCourseById(courseId);
    await db().persist(lecture);
    return lecture;
  } catch (e) {
    console.log(e);
    throw new Error('Problem creating lecture!');
  }
};

// Get a lecture by Id
const getLectureById = async (id: number): Promise<?Lecture> => {
  try {
    const lecture = await db().findOneById(id);
    return lecture;
  } catch (e) {
    throw new Error(`Problem getting lecture by id: ${id}!`);
  }
};

// Delete a lecture by Id
const deleteLectureById = async (id: number) => {
  try {
    const lecture = await db().findOneById(id);
    await db().remove(lecture);
  } catch (e) {
    throw new Error(`Problem deleting lecture by id: ${id}!`);
  }
};

// Update a lecture by Id
const updateLectureById = async (id: number, dateTime: number):
Promise<?Lecture> => {
  try {
    await db().createQueryBuilder('lectures')
      .where('lectures.id = :id')
      .setParameters({ id: id })
      .update({
        dateTime: dateTime
      })
      .execute();
    return await db().findOneById(id);
  } catch (e) {
    throw new Error(`Problem updating lecture by id: ${id}!`);
  }
};

// Get lectures by course id
const getLecturesByCourseId = async (courseId: number):
Promise<Array<?Lecture>> => {
  try {
    const lectures = await db().createQueryBuilder('lectures')
      .innerJoin('lectures.course', 'course', 'course.id=:courseId')
      .setParameters({ courseId: courseId })
      .getMany();
    return lectures;
  } catch (e) {
    throw new Error('Problem getting lectures!');
  }
};

// Returns lectures in reverse chronological order starting at the cursor
const paginateLectureByCourseId = async (courseId: number, cursor: number,
  items: number): Promise<Array<?Lecture>> => {
  try {
    const lectures = await db().createQueryBuilder('lectures')
      .innerJoin('lectures.course', 'course', 'course.id = :courseId')
      .where('lectures.createdAt <= :c')
      .setParameters({courseId: courseId, c: cursor})
      .orderBy('lectures.createdAt', 'DESC')
      .setMaxResults(items)
      .getMany();
    return lectures;
  } catch (e) {
    throw new Error('Problem getting lectures!');
  }
};

export default {
  createLecture,
  getLectureById,
  deleteLectureById,
  updateLectureById,
  getLecturesByCourseId,
  paginateLectureByCourseId
};
