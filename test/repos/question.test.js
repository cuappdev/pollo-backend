import SessionsRepo from '../../src/repos/SessionsRepo';
import QuestionsRepo from '../../src/repos/QuestionsRepo';
import UsersRepo from '../../src/repos/UsersRepo';
import dbConnection from '../../src/db/DbConnection';

var session;
var question1;
var question2;
var user;

beforeAll(async () => {
  await dbConnection().catch(function (e) {
    console.log('Error connecting to database');
    process.exit();
  });
  user = await UsersRepo.createDummyUser('googleId');
  session =
    await SessionsRepo.createSession('Session', SessionsRepo.createCode(), user);
});

test('Create Question', async () => {
  const text = 'Why do we have to test shit? (PG-13)';
  question1 =
    await QuestionsRepo.createQuestion(text, session, user);
  expect(question1.text).toBe(text);
  expect(question1.session.id).toBe(session.id);
  expect(question1.user.id).toBe(user.id);
});

test('Get Question', async () => {
  const question = await QuestionsRepo.getQuestionById(question1.id);
  expect(question.id).toBe(question1.id);
  expect(question.text).toBe(question1.text);
});

test('Update Question', async () => {
  var text = 'Why do we have to test stuff? (PG)';
  const question = await QuestionsRepo.updateQuestionById(question1.id, text);
  expect(question1.id).toBe(question.id);
  expect(question1.text).not.toBe(question.text);
  question1.text = question.text;
});

test('Get Questions From Session', async () => {
  const questions = await QuestionsRepo.getQuestionsFromSessionId(session.id);
  expect(questions.length).toBe(1);
  expect(questions[0].id).toBe(question1.id);
  expect(questions[0].text).toBe(question1.text);
  expect(questions[0].user.id).toBe(question1.user.id);
});

test('Create A New Question', async () => {
  const text = 'Why is testing so annoying?';
  question2 = await QuestionsRepo.createQuestion(text, session, user);
  expect(question2.text).toBe(text);
  expect(question2.user.id).toBe(user.id);
  expect(question2.session.id).toBe(session.id);
});

test('Get Session From Both Questions', async () => {
  var temp = await QuestionsRepo.getSessionFromQuestionId(question1.id);
  expect(temp.id).toBe(session.id);
  temp = await QuestionsRepo.getSessionFromQuestionId(question2.id);
  expect(temp.id).toBe(session.id);
});

test('Verify Ownership', async () => {
  const tempUser = await UsersRepo.createDummyUser('wastemon');
  expect(await QuestionsRepo.isOwnerById(question1.id, user)).toBeTruthy();
  expect(await QuestionsRepo.isOwnerById(question2.id, user)).toBeTruthy();
  expect(await QuestionsRepo.isOwnerById(question1.id, tempUser)).toBeFalsy();
  await UsersRepo.deleteUserById(tempUser.id);
});

test('Delete Question', async () => {
  await QuestionsRepo.deleteQuestionById(question1.id);
  await QuestionsRepo.deleteQuestionById(question2.id);
  expect(await QuestionsRepo.getQuestionById(question1.id)).not.toBeDefined();
  expect(await QuestionsRepo.getQuestionById(question2.id)).not.toBeDefined();
});

afterAll(async () => {
  await UsersRepo.deleteUserById(user.id);
  await SessionsRepo.deleteSessionById(session.id);
});
