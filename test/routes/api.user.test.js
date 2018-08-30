import dbConnection from '../../src/db/DbConnection';
import UsersRepo from '../../src/repos/UsersRepo';
import UserSessionsRepo from '../../src/repos/UserSessionsRepo';

const request = require('request-promise-native');
const { get } = require('./lib');

// Users
// Must be running server to test

const googleId = 'usertest';
let session;
let user;
let token;

beforeAll(async () => {
  await dbConnection().catch((e) => {
    console.log('Error connecting to database');
    process.exit();
  });
  user = await UsersRepo.createDummyUser(googleId);
  session = await UserSessionsRepo.createOrUpdateSession(user, null, null);
  token = session.sessionToken;
});

test('get user', async () => {
  const getstr = await request(get('/users/', token));
  const getres = getstr;
  expect(getres.success).toBeTruthy();
  expect(user.id).toBe(getres.data.id);
  expect(user.netId).toBe(getres.data.netId);
});

afterAll(async () => {
  await UsersRepo.deleteUserById(user.id);
  await UserSessionsRepo.deleteSession(session.id);
  console.log('Passed all user route tests');
});
