// @flow
import { getConnectionManager, Repository } from 'typeorm';
import {Course} from '../models/Course';
import {User} from '../models/User';
import OrganizationsRepo from './OrganizationsRepo';
import UsersRepo from './UsersRepo';
import appDevUtils from '../utils/appDevUtils';

const db = (): Repository<Course> => {
  return getConnectionManager().get().getRepository(Course);
};

// Contains all course codes used mapped to course id
var courseCodes = {};

// Create a course
const createCourse = async (name: string,
  term: string, organizationId: number, adminId: number): Promise<Course> => {
  try {
    const course = new Course();
    course.name = name;
    course.term = term;
    course.organization = await OrganizationsRepo.getOrgById(organizationId);
    var code = appDevUtils.randomCode(6);
    while (courseCodes[code]) {
      code = appDevUtils.randomCode(6);
    }
    course.code = code;

    const admin = await UsersRepo.getUserById(adminId);
    if (!admin) throw new Error('Problem getting admin from id!');
    course.admins = [admin];

    await db().persist(course);
    courseCodes[course.code] = course.id;
    return course;
  } catch (e) {
    throw new Error('Problem creating course!');
  }
};

// Get a course by Id
const getCourseById = async (id: number): Promise<?Course> => {
  try {
    const course = await db().findOneById(id);
    return course;
  } catch (e) {
    throw new Error(`Problem getting course by id: ${id}!`);
  }
};

// Get a course id from course code
const getCourseId = (code: string) => {
  var id = courseCodes[code];
  if (!id) throw new Error('Could not find course associated with given code.');
  return id;
};

// Delete a course by Id
const deleteCourseById = async (id: number) => {
  try {
    const course = await db().findOneById(id);
    await db().remove(course);
  } catch (e) {
    throw new Error(`Problem deleting course by id: ${id}!`);
  }
};

// Update a course by Id
const updateCourseById = async (id: number, name: ?string, term: ?string):
  Promise<?Course> => {
  try {
    var field = {};
    if (name) field.name = name;
    if (term) field.term = term;
    await db().createQueryBuilder('courses')
      .where('courses.id = :courseId')
      .setParameters({ courseId: id })
      .update(field)
      .execute();
    return await db().findOneById(id);
  } catch (e) {
    throw new Error(`Problem updating course by id: ${id}!`);
  }
};

// Get courses by org id
const getCoursesByOrgId = async (orgId: number): Promise<Array<?Course>> => {
  try {
    const courses = await db().createQueryBuilder('courses')
      .innerJoin('courses.organization', 'organization',
        'organization = :orgId')
      .setParameters({ orgId: orgId })
      .getMany();
    return courses;
  } catch (e) {
    throw new Error('Problem getting courses!');
  }
};

// add students to course
const addStudents = async (courseCode: string, studentIds: number[]) => {
  try {
    const course = await db().createQueryBuilder('courses')
      .leftJoinAndSelect('courses.organization', 'organization')
      .leftJoinAndSelect('courses.admins', 'admins')
      .leftJoinAndSelect('courses.lectures', 'lectures')
      .leftJoinAndSelect('courses.students', 'students')
      .where('courses.code = :courseCode')
      .setParameters({ courseCode: courseCode })
      .getOne();
    var students = course.students;
    students = students.concat(await UsersRepo.getUsersFromIds(studentIds));
    course.students = students;
    await db().persist(course);
  } catch (e) {
    throw new Error('Problem adding students to course!');
  }
};

// remove students from course
const removeStudents = async (id: number, studentIds: number[]) => {
  try {
    const course = await db().createQueryBuilder('courses')
      .leftJoinAndSelect('courses.organization', 'organization')
      .leftJoinAndSelect('courses.admins', 'admins')
      .leftJoinAndSelect('courses.lectures', 'lectures')
      .leftJoinAndSelect('courses.students', 'students')
      .where('courses.id = :courseId')
      .setParameters({ courseId: id })
      .getOne();
    course.students = course.students.filter(function (student) {
      return !studentIds.includes(student.id);
    });
    await db().persist(course);
  } catch (e) {
    throw new Error('Problem removing students from course!');
  }
};

// add admins to course
const addAdmins = async (id: number, adminIds: number[]) => {
  try {
    const course = await db().createQueryBuilder('courses')
      .leftJoinAndSelect('courses.organization', 'organization')
      .leftJoinAndSelect('courses.admins', 'admins')
      .leftJoinAndSelect('courses.lectures', 'lectures')
      .leftJoinAndSelect('courses.students', 'students')
      .where('courses.id = :courseId')
      .setParameters({ courseId: id })
      .getOne();
    var admins = course.admins;
    admins = admins.concat(await UsersRepo.getUsersFromIds(adminIds));
    course.admins = admins;
    await db().persist(course);
  } catch (e) {
    console.log(e);
    throw new Error('Problem adding admins to course!');
  }
};

// remove admins from course
const removeAdmins = async (id: number, adminIds: number[]) => {
  try {
    const course = await db().createQueryBuilder('courses')
      .leftJoinAndSelect('courses.organization', 'organization')
      .leftJoinAndSelect('courses.students', 'students')
      .leftJoinAndSelect('courses.lectures', 'lectures')
      .leftJoinAndSelect('courses.admins', 'admins')
      .where('courses.id = :courseId')
      .setParameters({ courseId: id })
      .getOne();

    course.admins = course.admins.filter(function (admin) {
      return !adminIds.includes(admin.id);
    });
    await db().persist(course);
  } catch (e) {
    console.log(e);
    throw new Error('Problem removing admins from course!');
  }
};

// get students in course
const getStudents = async (id: number): Promise<Array<?User>> => {
  try {
    const course = await db().createQueryBuilder('courses')
      .innerJoinAndSelect('courses.students', 'students')
      .where('courses.id=:courseId')
      .setParameters({ courseId: id })
      .getOne();
    return (course) ? course.students : [];
  } catch (e) {
    throw new Error('Problem getting students from course!');
  }
};

// get admins in course
const getAdmins = async (id: number): Promise<Array<?User>> => {
  try {
    const course = await db().createQueryBuilder('courses')
      .innerJoinAndSelect('courses.admins', 'admins')
      .where('courses.id=:courseId')
      .setParameters({ courseId: id })
      .getOne();
    return (course) ? course.admins : [];
  } catch (e) {
    console.log(e);
    throw new Error('Problem getting admins from course!');
  }
};

// Returns courses in reverse chronological order starting at the cursor
const paginateCourseByOrgId = async (orgId: number, cursor?: number,
  items?: number): Promise<Array<?Course>> => {
  if (cursor === undefined) {
    cursor = (new Date()).getTime();
  }

  try {
    const courses = await db().createQueryBuilder('courses')
      .innerJoin('courses.organization', 'organization',
        'organization.id = :orgId')
      .where('courses.createdAt <= :c')
      .setParameters({orgId: orgId, c: cursor})
      .orderBy('courses.createdAt', 'DESC')
      .setMaxResults(items)
      .getMany();
    return courses;
  } catch (e) {
    throw new Error('Problem getting courses!');
  }
};

export default {
  createCourse,
  getCourseById,
  getCoursesByOrgId,
  getCourseId,
  addStudents,
  removeStudents,
  addAdmins,
  removeAdmins,
  getStudents,
  getAdmins,
  paginateCourseByOrgId,
  updateCourseById,
  deleteCourseById
};
