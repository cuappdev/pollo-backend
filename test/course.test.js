import CoursesRepo from '../src/repos/CoursesRepo';
import OrganizationRepo from '../src/repos/OrganizationsRepo';
import UsersRepo from '../src/repos/UsersRepo';
import dbConnection from '../src/db/DbConnection';

var id;
var adminId;
var orgId;

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
});

test('Create Course', async () => {
  const course = await CoursesRepo.createCourse(
    'Functional Programming and Data Structures', 'FA \'17', orgId, adminId);
  expect(course.name).toBe('Functional Programming and Data Structures');
  expect(course.term).toBe('FA \'17');
  id = course.id;
});

test('Get Course', async () => {
  const course = await CoursesRepo.getCourseById(id);
  expect(course.name).toBe('Functional Programming and Data Structures');
  expect(course.term).toBe('FA \'17');
});

test('Get Courses', async () => {
  const courses = await CoursesRepo.getCoursesByOrgId(orgId);
  const course = await CoursesRepo.getCourseById(id);
  expect(courses).toContainEqual(course);
});

test('Update Course', async () => {
  const course = await CoursesRepo.updateCourseById(id, 'Networks',
    'SP \'18');
  expect(course.name).toBe('Networks');
  expect(course.term).toBe('SP \'18');
});

test('Delete Course', async () => {
  await CoursesRepo.deleteCourseById(id);
  expect(await CoursesRepo.getCourseById(id)).not.toBeDefined();
});

// Teardown
afterAll(async () => {
  await UsersRepo.deleteUserById(adminId);
  await OrganizationRepo.deleteOrgById(orgId);
});
