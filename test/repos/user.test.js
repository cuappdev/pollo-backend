import SessionsRepo from '../../src/repos/SessionsRepo';
import UsersRepo from '../../src/repos/UsersRepo';
import dbConnection from '../../src/db/DbConnection';
import appDevUtils from '../../src/utils/appDevUtils';

let id;
let session;
const googleId = appDevUtils.randomCode(6);

// Connects to db before running tests and does setup
beforeAll(async () => {
  await dbConnection().catch((e) => {
    console.log('Error connecting to database');
    process.exit();
  });
});

test('Create User', async () => {
  const user = await UsersRepo.createDummyUser(googleId);
  expect(user.googleId).toBe(googleId);
  expect(user.netId).toBe('');
  ({ id } = user);
});

test('Get User by Id', async () => {
  const user = await UsersRepo.getUserById(id);
  expect(user.id).toEqual(id);
  expect(user.googleId).toBe(googleId);
});

test('Get User by googleId', async () => {
  const user = await UsersRepo.getUserByGoogleId(googleId);
  expect(user.id).toEqual(id);
  expect(user.googleId).toBe(googleId);
});

test('Get Users', async () => {
  const users = await UsersRepo.getUsers();
  const user = users.find(u => u.id === id);
  expect(user).toBeDefined();
});

test('Get Users by googleId', async () => {
  const users = await UsersRepo.getUsersByGoogleIds([googleId]);
  expect(users.length).toEqual(1);
  expect(users[0].googleId).toBe(googleId);
});

test('Get Sessions', async () => {
  const user = await UsersRepo.getUserById(id);
  const code = await SessionsRepo.createCode();
  session = await SessionsRepo.createSession('name', code, user);
  const adminSessions = await UsersRepo.getSessionsById(id, 'admin');
  const memberSessions = await UsersRepo.getSessionsById(id, 'member');
  expect(adminSessions.length).toEqual(1);
  expect(memberSessions.length).toEqual(0);
  expect(adminSessions[0].id).toBe(session.id);
  await SessionsRepo.deleteSessionById(session.id);
});

test('Delete User', async () => {
  await UsersRepo.deleteUserById(id);
  expect(await UsersRepo.getUserById(id)).not.toBeDefined();
});

// Teardown
afterAll(async () => {
  console.log('Passed all user tests');
});
