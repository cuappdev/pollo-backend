import dbConnection from '../../src/db/DbConnection';
import UsersRepo from '../../src/repos/UsersRepo';
import UserSessionsRepo from '../../src/repos/UserSessionsRepo';
import SessionsRepo from '../../src/repos/SessionsRepo';
const request = require('request-promise-native');
const { get, post, del, put } = require('./lib');

// Sessions
// Must be running server to test

const opts = {name: 'Test session', code: SessionsRepo.createCode()};
const opts2 = {name: 'New session'};
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
  const option = post('/sessions/', opts, token);
  const result = await request(option);
  sessionres = result;
  expect(sessionres.success).toBeTruthy();
});

test('get single session', async () => {
  const getstr = await request(get(`/sessions/${sessionres.data.node.id}`, token));
  const getres = getstr;
  expect(getres.success).toBeTruthy();
  expect(sessionres).toMatchObject(getres);
});

test('get sessions for admin', async () => {
  const getstr = await request(get('/sessions/all/admin', token));
  const getres = getstr;
  expect(getres.success).toBeTruthy();
  expect(sessionres.data).toMatchObject(getres.data[0]);
});

test('get admins for session', async () => {
  const getstr = await request(get(`/sessions/${sessionres.data.node.id}/admins/`, token));
  const getres = getstr;
  expect(getres.success).toBeTruthy();
  const edges = getres.data.edges;
  expect(edges.length).toBe(1);
  expect(edges[0].node.id).toBe(userId);
});

test('get members for session', async () => {
  const getstr = await request(get(`/sessions/${sessionres.data.node.id}/members/`, token));
  const getres = getstr;
  expect(getres.success).toBeTruthy();
  const edges = getres.data.edges;
  expect(edges.length).toBe(0);
});

test('add/remove members from session', async () => {
  const user = await UsersRepo.createDummyUser('dummy');
  const body = {
    memberIds: [user.id]
  };
  const getstr =
    await request(post(`/sessions/${sessionres.data.node.id}/members/`, body, token));
  const getres = getstr;
  expect(getres.success).toBeTruthy();
  await UsersRepo.deleteUserById(user.id);
});

test('get sessions for admin', async () => {
  const getstr = await request(get('/sessions/all/admin/', token));
  const getres = getstr;
  expect(getres.success).toBeTruthy();
  expect(getres.data[0]).toMatchObject(sessionres.data);
});

test('update session', async () => {
  const getstr =
    await request(put(`/sessions/${sessionres.data.node.id}`, opts2, token));
  const getres = getstr;
  expect(getres.success).toBeTruthy();
  expect(getres.data.node.name).toBe('New session');
});

test('update session with invalid token', async () => {
  const getstr =
    await request(put(`/sessions/${sessionres.data.node.id}`, opts2, 'invalid'));
  const getres = getstr;
  expect(getres.success).toBeFalsy();
});

test('delete session with invalid token', async () => {
  const result =
    await request(del(`/sessions/${sessionres.data.node.id}`, 'invalid'));
  expect(result.success).toBeFalsy();
});

test('delete session', async () => {
  const result =
    await request(del(`/sessions/${sessionres.data.node.id}`, token));
  expect(result.success).toBeTruthy();
});

afterAll(async () => {
  await UsersRepo.deleteUserById(userId);
  await UserSessionsRepo.deleteSession(session.id);
  console.log('Passed all session route tests');
});
