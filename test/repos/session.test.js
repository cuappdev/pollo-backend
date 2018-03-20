import SessionsRepo from '../../src/repos/SessionsRepo';
import UsersRepo from '../../src/repos/UsersRepo';
import dbConnection from '../../src/db/DbConnection';

const googleId = 'usertest1';
var user;
var sessionId;

// Connects to db before running tests and does setup
beforeAll(async () => {
  await dbConnection().catch(function (e) {
    console.log('Error connecting to database');
    process.exit();
  });

  user = await UsersRepo.createDummyUser(googleId);
});

test('Create Session', async () => {
  const session =
    await SessionsRepo.createOrUpdateSession(user, 'access', 'refresh');
  sessionId = session.id;
  expect(session.isActive).toBeTruthy();
  expect(session.sessionToken).toBe('access');
  expect(session.updateToken).toBe('refresh');
});

test('Get User From Token', async () => {
  user = await SessionsRepo.getUserFromToken('access');
  expect(user.googleId).toEqual(googleId);
  const nullUser = await SessionsRepo.getUserFromToken('invalid');
  expect(nullUser).toBeNull();
});

test('Verify session', async () => {
  const valid = await SessionsRepo.verifySession('access');
  expect(valid).toBeTruthy();
  const invalid = await SessionsRepo.verifySession('invalid');
  expect(invalid).toBeFalsy();
});

test('Update session', async () => {
  const nullObj = await SessionsRepo.updateSession('invalid');
  expect(nullObj).toBeNull();
  const obj = await SessionsRepo.updateSession('refresh');
  expect(obj.isActive).toBeTruthy();
});

// Teardown
afterAll(async () => {
  await SessionsRepo.deleteSession(sessionId);
  await UsersRepo.deleteUserById(user.id);
  console.log('Passed all session tests');
});
