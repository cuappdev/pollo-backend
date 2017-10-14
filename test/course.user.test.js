import CoursesRepo from '../src/repos/CoursesRepo';
import OrganizationRepo from '../src/repos/OrganizationsRepo';
import UsersRepo from '../src/repos/UsersRepo';
import dbConnection from '../src/db/DbConnection';

var courseId;
var adminId;
var studentIds = [];
var adminIds = [];

// Connects to db before running tests and does setup
beforeAll(async () => {
  await dbConnection().catch(function (e) {
    console.log('Error connecting to database');
  });
  const org = await OrganizationRepo.createOrganization('Temp Organization');

  const fields = {googleId: 'DJP79N',
    netId: 'mc47',
    firstName: 'Michael',
    lastName: 'Clarkson',
    email: 'mc47@cornell.edu'};
  const admin = await UsersRepo.createUser(fields);
  adminId = admin.id;

  const course = await CoursesRepo.createCourse('CS', 3110,
    'Functional Programming and Data Structures', 'FA \'17', org.id, admin.id);
  courseId = course.id;
});

test('Add and Get Students', async () => {
  var studentList = [];
  for (var i = 0; i < 5; i++) {
    const fields = {
      googleId: 'googleId' + i,
      netId: 'netId' + i,
      firstName: 'firstName' + i,
      lastName: 'lastName' + i,
      email: 'email' + i
    };
    const student = await UsersRepo.createUser(fields);
    studentList.push(student);
    studentIds.push(student.id);
  }
  await CoursesRepo.addStudents(courseId, studentIds);
  expect(await CoursesRepo.getStudents(courseId)).toEqual(studentList);
});

test('Add and Get Admins', async () => {
  var adminList = [await UsersRepo.getUserById(adminId)];
  for (var i = 5; i < 10; i++) {
    const fields = {
      googleId: 'googleId' + i,
      netId: 'netId' + i,
      firstName: 'firstName' + i,
      lastName: 'lastName' + i,
      email: 'email' + i
    };
    const admin = await UsersRepo.createUser(fields);
    adminList.push(admin);
    adminIds.push(admin.id);
  }
  await CoursesRepo.addAdmins(courseId, adminIds);
  expect(await CoursesRepo.getAdmins(courseId)).toEqual(adminList);
});

test('Remove Students', async () => {
  await CoursesRepo.removeStudents(courseId);
  const students = await CoursesRepo.getStudents(courseId);
  expect(students).toHaveLength(0);
});

test('Remove Admins', async () => {
  await CoursesRepo.removeAdmins(courseId);
  const admins = await CoursesRepo.getAdmins(courseId);
  expect(admins).toHaveLength(0);
});

// Teardown
afterAll(async () => {
  await CoursesRepo.deleteCourseById(courseId);
  await UsersRepo.deleteUserById(adminId);
  for (var i = 0; i < studentIds.length; i++) {
    await UsersRepo.deleteUserById(studentIds[i]);
  }
  for (var j = 0; j < adminIds.length; j++) {
    await UsersRepo.deleteUserById(adminIds[j]);
  }
});
