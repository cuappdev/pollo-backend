import dbConnection from '../../src/db/DbConnection';
import UsersRepo from '../../src/repos/UsersRepo';
import UserSessionsRepo from '../../src/repos/UserSessionsRepo';
const request = require('request-promise-native');
const { get, post, del, put } = require('./lib');

// Sessions
// Must be running server to test

const opts = {name: 'Test session', code: 'ABC123', deviceId: 'IPHONE'};
const opts2 = {name: 'New session', deviceId: 'IPHONE'};
const opts3 = {name: 'New session', deviceId: 'invalid'};
const googleId = 'usertest';
var token, session, sessionres, userId;

beforeAll(async () => {
  await dbConnection().catch(function (e) {
    console.log('Error connecting to database');
    process.exit();
  });

  const user = await UsersRepo.createDummyUser(googleId);
  userId = user.id;
  session = await UserSessionsRepo.createOrUpdateSession(user, null, null);
  token = session.sessionToken;
});

test('create session', async () => {
  const result = await request(post('/sessions/', opts, token));
  sessionres = JSON.parse(result);
  expect(sessionres.success).toBeTruthy();
});

test('get single session', async () => {
  const getstr = await request(get(`/sessions/${sessionres.data.node.id}`, token));
  const getres = JSON.parse(getstr);
  expect(getres.success).toBeTruthy();
  expect(sessionres).toMatchObject(getres);
});

test('update session', async () => {
  const getstr =
    await request(put(`/sessions/${sessionres.data.node.id}`, opts2, token));
  const getres = JSON.parse(getstr);
  expect(getres.success).toBeTruthy();
  expect(getres.data.node.name).toBe('New session');
});

test('update session with invalid token', async () => {
  const getstr =
    await request(put(`/sessions/${sessionres.data.node.id}`, opts3, 'invalid'));
  const getres = JSON.parse(getstr);
  expect(getres.success).toBeFalsy();
});

test('delete session with invalid token', async () => {
  const result =
    await request(del(`/sessions/${sessionres.data.node.id}`, 'invalid'));
  expect(JSON.parse(result).success).toBeFalsy();
});

test('delete session', async () => {
  const result =
    await request(del(`/sessions/${sessionres.data.node.id}`, token));
  expect(JSON.parse(result).success).toBeTruthy();
});

afterAll(async () => {
  await UsersRepo.deleteUserById(userId);
  await UserSessionsRepo.deleteSession(session.id);
  console.log('Passed all session route tests');
});
