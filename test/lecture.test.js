import LecturesRepo from '../src/repos/LecturesRepo';
import CoursesRepo from '../src/repos/CoursesRepo';
import OrganizationRepo from '../src/repos/OrganizationsRepo';
import UsersRepo from '../src/repos/UsersRepo';
import dbConnection from '../src/db/DbConnection';

var id;
var courseId;
var orgId;
var adminId;

// Connects to db before running tests and does setup
beforeAll(async () => {
  await dbConnection().catch(function (e) {
    console.log('Error connecting to database');
  });
  const org = await OrganizationRepo.createOrganization('Temp Organization');
  orgId = org.id;

  const fields = {googleId: '12DJiE9',
    netId: 'ml944',
    firstName: 'Megan',
    lastName: 'Le',
    email: 'ml944@cornell.edu'};
  const admin = await UsersRepo.createUser(fields);
  adminId = admin.id;

  const course = await CoursesRepo.createCourse(
    'Functional Programming and Data Structures', 'FA \'17', orgId, adminId);
  courseId = course.id;
});

test('Create Lecture', async () => {
  const lecture = await LecturesRepo.createLecture(1507699498, courseId);
  expect(lecture.dateTime).toBe(1507699498);
  id = lecture.id;
});

test('Get Lecture', async () => {
  const lecture = await LecturesRepo.getLectureById(id);
  expect(lecture.dateTime).toBe(1507699498);
});

test('Get Lectures', async () => {
  const lectures = await LecturesRepo.getLecturesByCourseId(courseId);
  const lecture = await LecturesRepo.getLectureById(id);
  expect(lectures).toContainEqual(lecture);
});

test('Update Lecture', async () => {
  const lecture = await LecturesRepo.updateLectureById(id, 1507740309);
  expect(lecture.dateTime).toBe(1507740309);
});

test('Delete Lecture', async () => {
  await LecturesRepo.deleteLectureById(id);
  expect(await LecturesRepo.getLectureById(id)).not.toBeDefined();
});

// Teardown
afterAll(async () => {
  await UsersRepo.deleteUserById(adminId);
  await CoursesRepo.deleteCourseById(courseId);
  await OrganizationRepo.deleteOrgById(orgId);
});
