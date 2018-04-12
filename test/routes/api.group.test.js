import dbConnection from '../../src/db/DbConnection';
import UsersRepo from '../../src/repos/UsersRepo';
import UserSessionsRepo from '../../src/repos/UserSessionsRepo';
const request = require('request-promise-native');
const { get, post, del, put } = require('./lib');

// Groups
// Must be running server to test

const opts = {name: 'Test group', code: 'ABC123'};
const opts2 = {name: 'New group'};
const googleId = 'usertest';
const testUser = 'usertest2';
var token, session, userId, groupRes, testUserId, addOpts, addOpts2;

beforeAll(async () => {
  await dbConnection().catch(function (e) {
    console.log('Error connecting to database');
    process.exit();
  });

  const user = await UsersRepo.createDummyUser(googleId);
  userId = user.id;

  const t = await UsersRepo.createDummyUser(testUser);
  testUserId = t.id;
  addOpts = {'memberIds': JSON.stringify([testUserId])};
  addOpts2 = {'adminIds': JSON.stringify([testUserId])};

  session = await UserSessionsRepo.createOrUpdateSession(user, null, null);
  token = session.sessionToken;
});

test('create group without session or initial members', async () => {
  const result = await request(post('/groups/', opts, token));
  groupRes = JSON.parse(result);
  expect(groupRes.success).toBeTruthy();
});

test('get single group', async () => {
  const getstr = await request(get(`/groups/${groupRes.data.node.id}`, token));
  const getres = JSON.parse(getstr);
  expect(getres.success).toBeTruthy();
  expect(groupRes).toMatchObject(getres);
});

test('get group members', async () => {
  const getstr = await request(get(`/groups/${groupRes.data.node.id}/members`, token));
  const getres = JSON.parse(getstr);
  expect(getres.success).toBeTruthy();
  expect(getres.data.edges.length).toEqual(0);
});

test('get group admins', async () => {
  const getstr = await request(get(`/groups/${groupRes.data.node.id}/admins`, token));
  const getres = JSON.parse(getstr);
  expect(getres.success).toBeTruthy();
  expect(getres.data.edges[0].node.id).toEqual(userId);
});

test('add group members', async () => {
  const result = await request(post(`/groups/${groupRes.data.node.id}/members`, addOpts, token));
  const postres = JSON.parse(result);
  expect(postres.success).toBeTruthy();

  const getstr = await request(get(`/groups/${groupRes.data.node.id}/members`, token));
  const getres = JSON.parse(getstr);
  expect(getres.data.edges[0].node.id).toEqual(testUserId);
});

test('remove group members', async () => {
  const putstr =
    await request(put(`/groups/${groupRes.data.node.id}/members`, addOpts, token));
  const putres = JSON.parse(putstr);
  expect(putres.success).toBeTruthy();

  const getstr = await request(get(`/groups/${groupRes.data.node.id}/members`, token));
  const getres = JSON.parse(getstr);
  expect(getres.data.edges.length).toEqual(0);
});

test('add group admins', async () => {
  const result = await request(post(`/groups/${groupRes.data.node.id}/admins`, addOpts2, token));
  const postres = JSON.parse(result);
  expect(postres.success).toBeTruthy();

  const getstr = await request(get(`/groups/${groupRes.data.node.id}/admins`, token));
  const getres = JSON.parse(getstr);
  expect(getres.data.edges[1].node.id).toEqual(testUserId);
});

test('remove group admins', async () => {
  const putstr =
    await request(put(`/groups/${groupRes.data.node.id}/admins`, addOpts2, token));
  const putres = JSON.parse(putstr);
  expect(putres.success).toBeTruthy();

  const getstr = await request(get(`/groups/${groupRes.data.node.id}/admins`, token));
  const getres = JSON.parse(getstr);
  expect(getres.data.edges.length).toEqual(1);
});

test('update group', async () => {
  const getstr =
    await request(put(`/groups/${groupRes.data.node.id}`, opts2, token));
  const getres = JSON.parse(getstr);
  expect(getres.success).toBeTruthy();
  expect(getres.data.node.name).toBe('New group');
});

test('update session with invalid token', async () => {
  const getstr =
    await request(put(`/groups/${groupRes.data.node.id}`, opts2, 'invalid'));
  const getres = JSON.parse(getstr);
  expect(getres.success).toBeFalsy();
});

test('delete session with invalid token', async () => {
  const result =
    await request(del(`/groups/${groupRes.data.node.id}`, 'invalid'));
  expect(JSON.parse(result).success).toBeFalsy();
});

test('delete session', async () => {
  const result =
    await request(del(`/groups/${groupRes.data.node.id}`, token));
  expect(JSON.parse(result).success).toBeTruthy();
});

afterAll(async () => {
  await UsersRepo.deleteUserById(userId);
  await UsersRepo.deleteUserById(testUserId);
  await UserSessionsRepo.deleteSession(session.id);
  console.log('Passed all group route tests');
});
