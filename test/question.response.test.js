import LecturesRepo from '../src/repos/LecturesRepo';
import CoursesRepo from '../src/repos/CoursesRepo';
import OrganizationRepo from '../src/repos/OrganizationsRepo';
import UsersRepo from '../src/repos/UsersRepo';
import QuestionsRepo from '../src/repos/QuestionsRepo';
import ResponsesRepo from '../src/repos/ResponsesRepo';
import dbConnection from '../src/db/DbConnection';
import constants from '../src/utils/constants';

var questionId;
var responseId;
var courseId;
var orgId;
var adminId;
var lectureId;

// Connects to db before running tests and does setup
beforeAll(async () => {
  await dbConnection().catch(function (e) {
    console.log('Error connecting to database');
    process.exit();
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

  const lecture = await LecturesRepo.createLecture(1507699498, courseId);
  lectureId = lecture.id;
});

test('Create Question', async () => {
  const question = await QuestionsRepo.createQuestion('What is 1 + 1?',
    constants.QUESTION_TYPES.MULTIPLE_CHOICE, {'options': {
      'A': '1',
      'B': '2',
      'C': '3',
      'D': '4'},
    'answer': 'B'}, lectureId);
  expect(question.data.options).toEqual({
    'A': '1',
    'B': '2',
    'C': '3',
    'D': '4'});
  expect(question.data.answer).toEqual('B');
  questionId = question.id;
});

test('Get Question', async () => {
  const question = await QuestionsRepo.getQuestionById(questionId);
  expect(question.data.options).toEqual({
    'A': '1',
    'B': '2',
    'C': '3',
    'D': '4'});
  expect(question.data.answer).toEqual('B');
});

test('Get Questions', async () => {
  const questions = await QuestionsRepo.getQuestionsByLectureId(lectureId);
  const question = await QuestionsRepo.getQuestionById(questionId);
  expect(questions).toContainEqual(question);
});

test('Update Question', async () => {
  const question = await QuestionsRepo.updateQuestionById(questionId,
    'updated question', {'options': {'A': 'new choice', 'B': 'b', 'C': 'c'},
      'answer': 'A'});
  expect(question.text).toBe('updated question');
  expect(question.data.options).toEqual({
    'A': 'new choice',
    'B': 'b',
    'C': 'c'});
  expect(question.data.answer).toEqual('A');
});

test('Create Response', async () => {
  const response = await ResponsesRepo.createResponse({'answer': 'A'},
    questionId, adminId);
  expect(response.response.answer).toEqual('A');
  responseId = response.id;
});

test('Get Response', async () => {
  const response = await ResponsesRepo.getResponseById(responseId);
  expect(response.response.answer).toEqual('A');
});

test('Get Responses', async () => {
  const responses = await ResponsesRepo.getResponsesByQuestionId(questionId);
  const response = await ResponsesRepo.getResponseById(responseId);
  expect(responses).toContainEqual(response);
});

test('Update Response', async () => {
  const response = await ResponsesRepo.updateResponse(responseId,
    {'answer': 'B'});
  expect(response.response.answer).toEqual('B');
});

test('Delete Response', async () => {
  await ResponsesRepo.deleteResponseById(responseId);
  expect(await ResponsesRepo.getResponseById(responseId)).not.toBeDefined();
});

test('Delete Question', async () => {
  await QuestionsRepo.deleteQuestionById(questionId);
  expect(await QuestionsRepo.getQuestionById(questionId)).not.toBeDefined();
});

// Teardown
afterAll(async () => {
  await LecturesRepo.deleteLectureById(lectureId);
  await CoursesRepo.deleteCourseById(courseId);
  await OrganizationRepo.deleteOrgById(orgId);
  await UsersRepo.deleteUserById(adminId);
});
