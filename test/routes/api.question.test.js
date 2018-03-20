import dbConnection from '../../src/db/DbConnection';
import UsersRepo from '../../src/repos/UsersRepo';
import SessionsRepo from '../../src/repos/SessionsRepo';
const request = require('request-promise-native');
const { get, post, del, put } = require('./lib');

// Questions
// Must be running server to test

const googleId = 'usertest';
var poll, question, userId, session, token;

beforeAll(async () => {
  await dbConnection().catch(function (e) {
    console.log('Error connecting to database');
    process.exit();
  });
  const user = await UsersRepo.createDummyUser(googleId);
  userId = user.id;
  session = await SessionsRepo.createOrUpdateSession(user, null, null);
  token = session.sessionToken;

  // Create a poll
  const opts = {name: 'Test poll', code: '123456'};
  const result = await request(post('/polls/', opts, token));
  poll = JSON.parse(result).data.node;
  expect(JSON.parse(result).success).toBeTruthy();
});

test('create question', async () => {
  const opts = {text: 'Question text', results: {}, shared: true};
  const result = await request(post(`/polls/${poll.id}/question`, opts, token));
  question = JSON.parse(result).data.node;
  expect(JSON.parse(result).success).toBeTruthy();
});

test('create question with invalid token', async () => {
  const opts = {text: 'Question text', results: {}, shared: true};
  const result =
    await request(post(`/polls/${poll.id}/question`, opts, 'invalid'));
  expect(JSON.parse(result).success).toBeFalsy();
});

test('get question', async () => {
  const getstr = await request(get(`/questions/${question.id}`, token));
  const getres = JSON.parse(getstr);
  expect(getres.success).toBeTruthy();
  expect(question).toMatchObject(getres.data.node);
});

test('get questions', async () => {
  const getstr = await request(get(`/polls/${poll.id}/questions`, token));
  const getres = JSON.parse(getstr);
  expect(getres.success).toBeTruthy();
  expect(question).toMatchObject(getres.data.edges[0].node);
});

test('update question', async () => {
  const opts = {
    text: 'Updated text',
    results: JSON.stringify({'A': 1}),
    shared: false
  };
  const getstr = await request(put(`/questions/${question.id}`, opts, token));
  const getres = JSON.parse(getstr);
  expect(getres.success).toBeTruthy();
  expect(getres.data.node.text).toBe('Updated text');
  expect(getres.data.node.shared).toBeFalsy();
  expect(getres.data.node.results).toMatchObject({'A': 1});
});

test('update question with invalid token', async () => {
  const opts = {
    text: 'Updated text',
    results: JSON.stringify({'A': 1})
  };
  const getstr =
    await request(put(`/questions/${question.id}`, opts, 'invalid'));
  const getres = JSON.parse(getstr);
  expect(getres.success).toBeFalsy();
});

test('delete question with invalid token', async () => {
  const result = await request(del(`/questions/${question.id}`, 'invalid'));
  expect(JSON.parse(result).success).toBeFalsy();
});

test('delete question', async () => {
  const result = await request(del(`/questions/${question.id}`, token));
  expect(JSON.parse(result).success).toBeTruthy();
});

afterAll(async () => {
  const result =
    await request(del(`/polls/${poll.id}`, token));
  expect(JSON.parse(result).success).toBeTruthy();
  await UsersRepo.deleteUserById(userId);
  await SessionsRepo.deleteSession(session.id);
  console.log('Passed all question route tests');
});
