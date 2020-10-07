import UserSessionsRepo from '../../src/repos/UserSessionsRepo';
import UsersRepo from '../../src/repos/UsersRepo';
import dbConnection from '../../src/db/DbConnection';

const email = 'usertest1';
let sessionID;
let user;

// Connects to db before running tests and does setup
beforeAll(async () => {
  await dbConnection().catch((e) => {
    // eslint-disable-next-line no-console
    console.log('Error connecting to database');
    process.exit();
  });

  user = await UsersRepo.createDummyUser(email);
});

test('Create Session', async () => {
  const session = await UserSessionsRepo.createOrUpdateSession(user, 'access', 'refresh');
  sessionID = session.uuid;
  expect(session.isActive).toBe(true);
  expect(session.sessionToken).toBe('access');
  expect(session.updateToken).toBe('refresh');
});

test('Get User from Token', async () => {
  user = await UserSessionsRepo.getUserFromToken('access');
  expect(user.email).toEqual(email);
  const nullUser = await UserSessionsRepo.getUserFromToken('invalid');
  expect(nullUser).toBeNull();
});

test('Verify Session', async () => {
  const valid = await UserSessionsRepo.verifySession('access');
  expect(valid).toBe(true);
  const invalid = await UserSessionsRepo.verifySession('invalid');
  expect(invalid).toBe(false);
});

test('Update Session', async () => {
  const nullObj = await UserSessionsRepo.updateSession('invalid');
  expect(nullObj).toBeNull();
  const obj = await UserSessionsRepo.updateSession('refresh');
  expect(obj.isActive).toBe(true);
});

// Teardown
afterAll(async () => {
  await UserSessionsRepo.deleteSession(sessionID);
  await UsersRepo.deleteUserByID(user.uuid);
  // eslint-disable-next-line no-console
  console.log('Passed all session tests');
});
