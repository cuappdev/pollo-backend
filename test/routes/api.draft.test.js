import dbConnection from '../../src/db/DbConnection';
import UsersRepo from '../../src/repos/UsersRepo';
import UserSessionsRepo from '../../src/repos/UserSessionsRepo';
const request = require('request-promise-native');
const { get, post, del, put } = require('./lib');

var draft1, draft2, userId, userToken;

beforeAll(async () => {
  await dbConnection().catch(function (e) {
    console.log('Error connecting to database');
    process.exit();
  });
  const user = await UsersRepo.createDummyUser('googleId');
  userId = user.id;
  const session = await UserSessionsRepo.createOrUpdateSession(user, null, null);
  userToken = session.sessionToken;
});

test('Create a draft', async () => {
  const body = {
    text: 'Test draft',
    options: ['yes', 'no']
  };
  const getstr = await request(post('/drafts/', body, userToken));
  const getres = getstr;
  draft1 = getres.data.node;
  expect(getres.success).toBeTruthy();
  expect(draft1).toMatchObject(body);
});

test('Get drafts (Authorized)', async () => {
  const getstr = await request(get('/drafts/', userToken));
  const getres = getstr;
  const edges = getres.data.edges;
  expect(getres.success).toBeTruthy();
  expect(edges.length).toBe(1);
  expect(edges[0].node).toMatchObject(draft1);
});

test('Get drafts (Unauthorized)', async () => {
  const getstr = await request(get('/drafts/', 'blah'));
  const getres = getstr;
  expect(getres.success).toBeFalsy();
});

test('Update a draft', async () => {
  const body = {
    text: 'Test draft updated'
  };
  const getstr = await request(put(`/drafts/${draft1.id}`, body, userToken));
  const getres = getstr;
  const node = getres.data.node;
  expect(getres.success).toBeTruthy();
  expect(node.text).toBe(body.text);
  expect(node.options).toMatchObject(draft1.options);
  expect(node.id).toBe(draft1.id);
  draft1 = node;
});

test('Create another draft', async () => {
  const body = {
    text: 'Another One ... DJ Khaled',
    options: ['yes']
  };
  const getstr = await request(post('/drafts/', body, userToken));
  const getres = getstr;
  draft2 = getres.data.node;
  expect(getres.success).toBeTruthy();
  expect(draft2).toMatchObject(body);
});

test('Get updated list of drafts (Authorized)', async () => {
  const getstr = await request(get('/drafts/', userToken));
  const getres = getstr;
  const edges = getres.data.edges;
  expect(getres.success).toBeTruthy();
  expect(edges.length).toBe(2);
  expect(edges[0].node).toMatchObject(draft1);
  expect(edges[1].node).toMatchObject(draft2);
});

test('Delete draft', async () => {
  var result = await request(del(`/drafts/${draft1.id}`, userToken));
  expect(result.success).toBeTruthy();
  result = await request(del(`/drafts/${draft2.id}`, userToken));
  expect(result.success).toBeTruthy();
});

afterAll(async () => {
  UsersRepo.deleteUserById(userId);
});
