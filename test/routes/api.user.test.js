import dbConnection from '../../src/db/DbConnection';
import UsersRepo from '../../src/repos/UsersRepo';
import UserSessionsRepo from '../../src/repos/UserSessionsRepo';

const request = require('request-promise-native');
const { get } = require('./lib');

// Users
// Must be running server to test

const googleID = 'usertest';
let session;
let user;
let token;

beforeAll(async () => {
  await dbConnection().catch((e) => {
    // eslint-disable-next-line no-console
    console.log('Error connecting to database');
    process.exit();
  });
  user = await UsersRepo.createDummyUser(googleID);
  session = await UserSessionsRepo.createOrUpdateSession(user, null, null);
  token = session.sessionToken;
});

test('Get user', async () => {
  await request(get('/users/', token)).then((getres) => {
    expect(getres.success).toBe(true);
    expect(user.uuid).toBe(getres.data.id);
    expect(user.netID).toBe(getres.data.netID);
  });
});

afterAll(async () => {
  await UsersRepo.deleteUserByID(user.uuid);
  await UserSessionsRepo.deleteSession(session.uuid);
  // eslint-disable-next-line no-console
  console.log('Passed all user route tests');
});
