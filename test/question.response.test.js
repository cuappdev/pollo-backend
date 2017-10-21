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
    constants.QUESTION_TYPES.MULTIPLE_CHOICE, {'choices': ['0', '1', '2', '3'],
      'answer': ['0']}, lectureId);
  expect(question.data.choices).toEqual(['0', '1', '2', '3']);
  expect(question.data.answer).toEqual(['0']);
  questionId = question.id;
});

test('Get Question', async () => {
  const question = await QuestionsRepo.getQuestionById(questionId);
  expect(question.data.choices).toEqual(['0', '1', '2', '3']);
  expect(question.data.answer).toEqual(['0']);
});

test('Get Questions', async () => {
  const questions = await QuestionsRepo.getQuestionsByLectureId(lectureId);
  const question = await QuestionsRepo.getQuestionById(questionId);
  expect(questions).toContainEqual(question);
});

test('Update Question', async () => {
  const question = await QuestionsRepo.updateQuestionById(questionId,
    'updated question', {'choices': ['new choice', 'a', 'b'], 'answer': ['a']});
  expect(question.text).toBe('updated question');
  expect(question.data.choices).toEqual(['new choice', 'a', 'b']);
  expect(question.data.answer).toEqual(['a']);
});

test('Create Response', async () => {
  const response = await ResponsesRepo.createResponse({'answer': ['a']},
    questionId, adminId);
  expect(response.response.answer).toEqual(['a']);
  responseId = response.id;
});

test('Get Response', async () => {
  const response = await ResponsesRepo.getResponseById(responseId);
  expect(response.response.answer).toEqual(['a']);
});

test('Get Responses', async () => {
  const responses = await ResponsesRepo.getResponsesByQuestionId(questionId);
  const response = await ResponsesRepo.getResponseById(responseId);
  expect(responses).toContainEqual(response);
});

test('Update Response', async () => {
  const response = await ResponsesRepo.updateResponse(responseId,
    {'answer': ['b']});
  expect(response.response.answer).toEqual(['b']);
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
