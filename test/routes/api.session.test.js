import dbConnection from '../../src/db/DbConnection';
import UsersRepo from '../../src/repos/UsersRepo';
import UserSessionsRepo from '../../src/repos/UserSessionsRepo';
import SessionsRepo from '../../src/repos/SessionsRepo';

const request = require('request-promise-native');
const {
  get, post, del, put
} = require('./lib');

// Sessions
// Must be running server to test

const opts = { name: 'Test session', code: SessionsRepo.createCode() };
const opts2 = { name: 'New session' };
const googleId = 'usertest';
let adminToken;
let userToken;
let session;
let sessionres;
let adminId;
let userId;

beforeAll(async () => {
  await dbConnection().catch((e) => {
    console.log('Error connecting to database');
    process.exit();
  });

  const user = await UsersRepo.createDummyUser(googleId);
  adminId = user.id;
  session = await UserSessionsRepo.createOrUpdateSession(user, null, null);
  adminToken = session.sessionToken;
});

test('create session', async () => {
  const option = post('/sessions/', opts, adminToken);
  const result = await request(option);
  sessionres = result;
  expect(sessionres.success).toBeTruthy();
});

test('get single session', async () => {
  const getstr = await request(get(`/sessions/${sessionres.data.node.id}`, adminToken));
  const getres = getstr;
  expect(getres.success).toBeTruthy();
  expect(sessionres).toMatchObject(getres);
});

test('get sessions for admin', async () => {
  const getstr = await request(get('/sessions/all/admin', adminToken));
  const getres = getstr;
  expect(getres.success).toBeTruthy();
  expect(sessionres.data).toMatchObject(getres.data[0]);
});

test('add admins to session', async () => {
  const user = await UsersRepo.createDummyUser('dummy');
  userId = user.id;
  const body = {
    adminIds: [userId]
  };
  const getstr = await request(post(`/sessions/${sessionres.data.node.id}/admins/`, body, adminToken));
  const getres = getstr;
  expect(getres.success).toBeTruthy();
});

test('get admins for session', async () => {
  const getstr = await request(get(`/sessions/${sessionres.data.node.id}/admins/`, adminToken));
  const getres = getstr;
  expect(getres.success).toBeTruthy();
  const { edges } = getres.data;
  expect(edges.length).toBe(2);
  expect(edges[0].node.id).toBe(adminId);
  expect(edges[1].node.id).toBe(userId);
});

test('remove admin from session', async () => {
  const body = {
    adminIds: [userId]
  };
  const getstr = await request(put(`/sessions/${sessionres.data.node.id}/admins/`, body, adminToken));
  const getres = getstr;
  expect(getres.success).toBeTruthy();
  UsersRepo.deleteUserById(userId);
});

test('add members to session', async () => {
  const user = await UsersRepo.createDummyUser('dummy');
  userId = user.id;
  userToken = (await UserSessionsRepo.createOrUpdateSession(user, null, null)).sessionToken;
  const body = {
    memberIds: [userId]
  };
  const getstr = await request(post(`/sessions/${sessionres.data.node.id}/members/`, body, adminToken));
  const getres = getstr;
  expect(getres.success).toBeTruthy();
});

test('get sessions as member', async () => {
  const getstr = await request(get('/sessions/all/member/', userToken));
  const getres = getstr;
  expect(getres.success).toBeTruthy();
  expect(sessionres.data).toMatchObject(getres.data[0]);
});

test('get members of session', async () => {
  const getstr = await request(get(`/sessions/${sessionres.data.node.id}/members/`, adminToken));
  const getres = getstr;
  expect(getres.success).toBeTruthy();
  const { edges } = getres.data;
  expect(edges.length).toBe(1);
  expect(edges[0].node.id).toBe(userId);
});

test('remove member from session', async () => {
  const body = {
    memberIds: [userId]
  };
  const getstr = await request(put(`/sessions/${sessionres.data.node.id}/members`, body, adminToken));
  const getres = getstr;
  expect(getres.success).toBeTruthy();
  await UsersRepo.deleteUserById(userId);
});

test('get sessions for admin', async () => {
  const getstr = await request(get('/sessions/all/admin/', adminToken));
  const getres = getstr;
  expect(getres.success).toBeTruthy();
  expect(getres.data[0]).toMatchObject(sessionres.data);
});

test('update session', async () => {
  const getstr = await request(put(`/sessions/${sessionres.data.node.id}`, opts2, adminToken));
  const getres = getstr;
  expect(getres.success).toBeTruthy();
  expect(getres.data.node.name).toBe('New session');
});

test('update session with invalid adminToken', async () => {
  const getstr = await request(put(`/sessions/${sessionres.data.node.id}`, opts2, 'invalid'));
  const getres = getstr;
  expect(getres.success).toBeFalsy();
});

test('delete session with invalid adminToken', async () => {
  const result = await request(del(`/sessions/${sessionres.data.node.id}`, 'invalid'));
  expect(result.success).toBeFalsy();
});

test('delete session', async () => {
  const result = await request(del(`/sessions/${sessionres.data.node.id}`, adminToken));
  expect(result.success).toBeTruthy();
});

afterAll(async () => {
  await UsersRepo.deleteUserById(adminId);
  await UserSessionsRepo.deleteSession(session.id);
  console.log('Passed all session route tests');
});
