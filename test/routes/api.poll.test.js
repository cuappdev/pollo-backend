import dbConnection from '../../src/db/DbConnection';
import UsersRepo from '../../src/repos/UsersRepo';
import UserSessionsRepo from '../../src/repos/UserSessionsRepo';
const request = require('request-promise-native');
const { get, post, del, put } = require('./lib');

// Polls
// Must be running server to test

const googleId = 'usertest';
var session, poll, userId, session, token;

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
  const opts = {name: 'Test session', code: '123456'};
  const result = await request(post('/sessions/', opts, token));
  session = JSON.parse(result).data.node;
  expect(JSON.parse(result).success).toBeTruthy();
});

test('create poll', async () => {
  const opts = {text: 'Poll text', results: {}, shared: true};
  const result = await request(post(`/sessions/${session.id}/poll`, opts, token));
  poll = JSON.parse(result).data.node;
  expect(JSON.parse(result).success).toBeTruthy();
});

test('create poll with invalid token', async () => {
  const opts = {text: 'Poll text', results: {}, shared: true};
  const result =
    await request(post(`/sessions/${session.id}/poll`, opts, 'invalid'));
  expect(JSON.parse(result).success).toBeFalsy();
});

test('get poll', async () => {
  const getstr = await request(get(`/polls/${poll.id}`, token));
  const getres = JSON.parse(getstr);
  expect(getres.success).toBeTruthy();
  expect(poll).toMatchObject(getres.data.node);
});

test('get polls', async () => {
  const getstr = await request(get(`/sessions/${session.id}/polls`, token));
  const getres = JSON.parse(getstr);
  expect(getres.success).toBeTruthy();
  expect(poll).toMatchObject(getres.data.edges[0].node);
});

test('update poll', async () => {
  const opts = {
    text: 'Updated text',
    results: JSON.stringify({'A': 1}),
    shared: false
  };
  const getstr = await request(put(`/polls/${poll.id}`, opts, token));
  const getres = JSON.parse(getstr);
  expect(getres.success).toBeTruthy();
  expect(getres.data.node.text).toBe('Updated text');
  expect(getres.data.node.shared).toBeFalsy();
  expect(getres.data.node.results).toMatchObject({'A': 1});
});

test('update poll with invalid token', async () => {
  const opts = {
    text: 'Updated text',
    results: JSON.stringify({'A': 1})
  };
  const getstr =
    await request(put(`/polls/${poll.id}`, opts, 'invalid'));
  const getres = JSON.parse(getstr);
  expect(getres.success).toBeFalsy();
});

test('delete poll with invalid token', async () => {
  const result = await request(del(`/polls/${poll.id}`, 'invalid'));
  expect(JSON.parse(result).success).toBeFalsy();
});

test('delete poll', async () => {
  const result = await request(del(`/polls/${poll.id}`, token));
  expect(JSON.parse(result).success).toBeTruthy();
});

afterAll(async () => {
  const result =
    await request(del(`/sessions/${session.id}`, token));
  expect(JSON.parse(result).success).toBeTruthy();
  await UsersRepo.deleteUserById(userId);
  await UserSessionsRepo.deleteSession(session.id);
  console.log('Passed all poll route tests');
});
