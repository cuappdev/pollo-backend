import dbConnection from '../../src/db/DbConnection';
import UsersRepo from '../../src/repos/UsersRepo';
import UserSessionsRepo from '../../src/repos/UserSessionsRepo';
import GroupsRepo from '../../src/repos/GroupsRepo';

const request = require('request-promise-native');
const {
  get, post, del, put,
} = require('./lib');

let group;
let session;
let question;
let admin;
let member;
let adminToken;
let memberToken;

beforeAll(async () => {
  await dbConnection().catch((e) => {
    // eslint-disable-next-line no-console
    console.log('Error connecting to database');
    process.exit();
  });
  member = await UsersRepo.createDummyUser('member');
  admin = await UsersRepo.createDummyUser('admin');
  adminToken = (await UserSessionsRepo.createOrUpdateSession(admin, null, null)).sessionToken;
  memberToken = (await UserSessionsRepo.createOrUpdateSession(member, null, null)).sessionToken;

  const opts = { name: 'Test group', code: GroupsRepo.createCode() };
  await request(post('/sessions/', opts, adminToken)).then((result) => {
    group = result.data;
    expect(result.success).toBe(true);
  });

  await GroupsRepo.addUsersByGoogleIDs(group.id, ['member'], 'member');
});

test('create question', async () => {
  const opts = {
    text: 'Why do we have to test s***? (PG-13)',
  };
  await request(post(`/sessions/${group.id}/questions`, opts, memberToken)).then((result) => {
    question = result.data;
    expect(result.success).toBe(true);
  });
});

test('create question with invalid token', async () => {
  const opts = {
    text: 'Why do we have to test s***? (PG-13)',
  };
  await request(post(`/sessions/${group.id}/questions`, opts, adminToken))
    .catch((e) => {
      expect(e.statusCode).toBe(401);
    });
});

test('get question by id', async () => {
  await request(get(`/questions/${question.id}`, memberToken)).then((getres) => {
    expect(getres.success).toBe(true);
    expect(question.id).toBe(getres.data.id);
    expect(question.createdAt).toBe(getres.data.createdAt);
    expect(question.text).toBe(getres.data.text);
  });
});

test('get questions by group', async () => {
  await request(get(`/sessions/${group.id}/questions`, adminToken)).then((getres) => {
    expect(getres.success).toBe(true);
    expect(question.id).toBe(getres.data[0].id);
    expect(question.createdAt).toBe(getres.data[0].createdAt);
    expect(question.text).toBe(getres.data[0].text);
  });
});

test('update question', async () => {
  const opts = {
    text: 'Why do we have to test stuff? (PG)',
  };
  await request(put(`/questions/${question.id}`, opts, memberToken)).then((getres) => {
    expect(getres.success).toBe(true);
    expect(getres.data.text).toBe('Why do we have to test stuff? (PG)');
    expect(getres.data.id).toBe(question.id);
  });
});

test('update question with invalid token', async () => {
  const opts = {
    text: 'Why do we have to test stuff? (PG)',
  };
  await request(put(`/questions/${question.id}`, opts, adminToken))
    .catch((e) => {
      expect(e.statusCode).toBe(401);
    });
});

test('delete question', async () => {
  await request(del(`/questions/${question.id}`, memberToken)).then((result) => {
    expect(result.success).toBe(true);
  });
});

afterAll(async () => {
  await request(del(`/sessions/${group.id}`, adminToken)).then((result) => {
    expect(result.success).toBe(true);
  });
  await UsersRepo.deleteUserByID(admin.id);
  await UsersRepo.deleteUserByID(member.id);
  await UserSessionsRepo.deleteSession(session.id);
  // eslint-disable-next-line no-console
  console.log('Passed all question route tests');
});
