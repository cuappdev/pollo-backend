import dbConnection from '../../src/db/DbConnection';
import UsersRepo from '../../src/repos/UsersRepo';
import UserSessionsRepo from '../../src/repos/UserSessionsRepo';
import SessionsRepo from '../../src/repos/SessionsRepo';
const request = require('request-promise-native');
const {get, post, del, put} = require('./lib');

var session, question, admin, member, adminToken, memberToken;

beforeAll(async () => {
  await dbConnection().catch(function (e) {
    console.log('Error connecting to database');
    process.exit();
  });
  member = await UsersRepo.createDummyUser('member');
  admin = await UsersRepo.createDummyUser('admin');
  adminToken =
    (await UserSessionsRepo.createOrUpdateSession(admin, null, null)).sessionToken;
  memberToken =
    (await UserSessionsRepo.createOrUpdateSession(member, null, null)).sessionToken;

  const opts = {name: 'Test session', code: SessionsRepo.createCode()};
  const result = await request(post('/sessions/', opts, adminToken));
  session = result.data.node;
  expect(result.success).toBeTruthy();

  await SessionsRepo.addUsersByGoogleIds(session.id, ['member'], 'member');
});

test('create question', async () => {
  const opts = {
    text: 'Why do we have to test shit? (PG-13)'
  };
  const result = await request(post(`/sessions/${session.id}/questions`, opts, memberToken));
  question = result.data.node;
  expect(result.success).toBeTruthy();
});

test('create question with invalid token', async () => {
  const opts = {
    text: 'Why do we have to test shit? (PG-13)'
  };
  const result = await request(post(`/sessions/${session.id}/questions`, opts, adminToken));
  expect(result.success).toBeFalsy();
});

test('get question by id', async () => {
  const getstr = await request(get(`/questions/${question.id}`, memberToken));
  const getres = getstr;
  expect(getres.success).toBeTruthy();
  expect(question.id).toBe(getres.data.node.id);
});

test('get questions by session', async () => {
  const getstr = await request(get(`/sessions/${session.id}/questions`, adminToken));
  const getres = getstr;
  expect(getres.success).toBeTruthy();
  expect(question.id).toBe(getres.data.edges[0].node.id);
});

test('update question', async () => {
  const opts = {
    text: 'Why do we have to test stuff? (PG)'
  };
  const getstr = await request(put(`/questions/${question.id}`, opts, memberToken));
  const getres = getstr;
  expect(getres.success).toBeTruthy();
  expect(getres.data.node.text).toBe('Why do we have to test stuff? (PG)');
  expect(getres.data.node.id).toBe(question.id);
});

test('update question with invalid token', async () => {
  const opts = {
    text: 'Why do we have to test stuff? (PG)'
  };
  const getstr = await request(put(`/questions/${question.id}`, opts, adminToken));
  const getres = getstr;
  expect(getres.success).toBeFalsy();
});

test('delete question', async () => {
  const result = await request(del(`/questions/${question.id}`, memberToken));
  expect(result.success).toBeTruthy();
});

afterAll(async () => {
  const result =
    await request(del(`/sessions/${session.id}`, adminToken));
  expect(result.success).toBeTruthy();
  await UsersRepo.deleteUserById(admin.id);
  await UsersRepo.deleteUserById(member.id);
  await UserSessionsRepo.deleteSession(session.id);
  console.log('Passed all question route tests');
});
