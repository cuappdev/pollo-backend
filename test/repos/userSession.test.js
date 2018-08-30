import UserSessionsRepo from '../../src/repos/UserSessionsRepo';
import UsersRepo from '../../src/repos/UsersRepo';
import dbConnection from '../../src/db/DbConnection';

const googleId = 'usertest1';
let user;
let sessionId;

// Connects to db before running tests and does setup
beforeAll(async () => {
  await dbConnection().catch((e) => {
    console.log('Error connecting to database');
    process.exit();
  });

  user = await UsersRepo.createDummyUser(googleId);
});

test('Create Session', async () => {
  const session = await UserSessionsRepo.createOrUpdateSession(user, 'access', 'refresh');
  sessionId = session.id;
  expect(session.isActive).toBeTruthy();
  expect(session.sessionToken).toBe('access');
  expect(session.updateToken).toBe('refresh');
});

test('Get User From Token', async () => {
  user = await UserSessionsRepo.getUserFromToken('access');
  expect(user.googleId).toEqual(googleId);
  const nullUser = await UserSessionsRepo.getUserFromToken('invalid');
  expect(nullUser).toBeNull();
});

test('Verify session', async () => {
  const valid = await UserSessionsRepo.verifySession('access');
  expect(valid).toBeTruthy();
  const invalid = await UserSessionsRepo.verifySession('invalid');
  expect(invalid).toBeFalsy();
});

test('Update session', async () => {
  const nullObj = await UserSessionsRepo.updateSession('invalid');
  expect(nullObj).toBeNull();
  const obj = await UserSessionsRepo.updateSession('refresh');
  expect(obj.isActive).toBeTruthy();
});

// Teardown
afterAll(async () => {
  await UserSessionsRepo.deleteSession(sessionId);
  await UsersRepo.deleteUserById(user.id);
  console.log('Passed all session tests');
});
