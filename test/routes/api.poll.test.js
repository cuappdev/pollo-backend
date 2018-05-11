import dbConnection from '../../src/db/DbConnection';
import UsersRepo from '../../src/repos/UsersRepo';
import UserSessionsRepo from '../../src/repos/UserSessionsRepo';
import SessionsRepo from '../../src/repos/SessionsRepo';
const request = require('request-promise-native');
const { get, post, del, put } = require('./lib');

// Polls
// Must be running server to test

const googleId = 'usertest';
var session, poll, userId, token;

beforeAll(async () => {
  await dbConnection().catch(function (e) {
    console.log('Error connecting to database');
    process.exit();
  });
  const user = await UsersRepo.createDummyUser(googleId);
  userId = user.id;
  session = await UserSessionsRepo.createOrUpdateSession(user, null, null);
  token = session.sessionToken;

  // Create a session
  const opts = {name: 'Test session', code: SessionsRepo.createCode()};
  const result = await request(post('/sessions/', opts, token));
  session = result.data.node;
  expect(result.success).toBeTruthy();
});

test('create poll', async () => {
  const opts = {text: 'Poll text', shared: true, type: 'MULTIPLE_CHOICE'};
  const result = await request(post(`/sessions/${session.id}/polls`, opts, token));
  poll = result.data.node;
  expect(result.success).toBeTruthy();
});

test('create poll with invalid token', async () => {
  const opts = {text: 'Poll text', results: {}, shared: true};
  const result =
    await request(post(`/sessions/${session.id}/polls`, opts, 'invalid'));
  expect(result.success).toBeFalsy();
});

test('get poll by id', async () => {
  const getstr = await request(get(`/polls/${poll.id}`, token));
  const getres = getstr;
  expect(getres.success).toBeTruthy();
  expect(poll.id).toBe(getres.data.node.id);
});

test('get polls by session', async () => {
  const getstr = await request(get(`/sessions/${session.id}/polls`, token));
  const getres = getstr;
  expect(getres.success).toBeTruthy();
  expect(poll.id).toBe(getres.data.edges[0].node.id);
});

test('update poll', async () => {
  const opts = {
    text: 'Updated text',
    results: {'A': 1},
    shared: false
  };
  const getstr = await request(put(`/polls/${poll.id}`, opts, token));
  const getres = getstr;
  expect(getres.success).toBeTruthy();
  expect(getres.data.node.text).toBe('Updated text');
  expect(getres.data.node.results).toMatchObject({'A': 1});
});

test('update poll with invalid token', async () => {
  const opts = {
    text: 'Updated text',
    results: {'A': 1}
  };
  const getstr =
    await request(put(`/polls/${poll.id}`, opts, 'invalid'));
  const getres = getstr;
  expect(getres.success).toBeFalsy();
});

test('delete poll with invalid token', async () => {
  const result = await request(del(`/polls/${poll.id}`, 'invalid'));
  expect(result.success).toBeFalsy();
});

test('delete poll', async () => {
  const result = await request(del(`/polls/${poll.id}`, token));
  expect(result.success).toBeTruthy();
});

afterAll(async () => {
  const result =
    await request(del(`/sessions/${session.id}`, token));
  expect(result.success).toBeTruthy();
  await UsersRepo.deleteUserById(userId);
  await UserSessionsRepo.deleteSession(session.id);
  console.log('Passed all poll route tests');
});
