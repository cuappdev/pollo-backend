import SessionsRepo from '../../src/repos/SessionsRepo';
import UsersRepo from '../../src/repos/UsersRepo';
import dbConnection from '../../src/db/DbConnection';

var id;
var code;
var user;
var user2;
var poll;
var poll2;

// Connects to db before running tests and does setup
beforeAll(async () => {
  await dbConnection().catch(function (e) {
    console.log('Error connecting to database');
    process.exit();
  });
});

test('Create Session', async () => {
  code = SessionsRepo.createCode();
  user = await UsersRepo.createDummyUser('sessiontest1');

  const session = await SessionsRepo.createSession('Session', code, user, false);
  expect(session.name).toBe('Session');
  expect(session.code).toBe(code);
  expect(session.admins[0].googleId).toBe(user.googleId);
  id = session.id;
});

test('Get Session By Id', async () => {
  const session = await SessionsRepo.getSessionById(id);
  expect(session.name).toBe('Session');
  expect(session.code).toBe(code);
});

test('Get Session By Code', async () => {
  const _id = await SessionsRepo.getSessionId(code);
  expect(_id).toBe(id);
});

test('Update Session', async () => {
  const session = await SessionsRepo.updateSessionById(id, 'New Session');
  expect(session.name).toBe('New Session');
});

test('Get Admins From Session', async () => {
  const admins = await SessionsRepo.getUsersBySessionId(id, 'admin');
  expect(admins.length).toEqual(1);
  expect(admins[0].googleId).toBe(user.googleId);
});

test('Add Admin To Session By Id', async () => {
  user2 = await UsersRepo.createDummyUser('sessiontest2');
  const admins = (await SessionsRepo.addUsersByIds(id, [user2.id], 'admin')).admins;
  expect(admins.length).toEqual(2);
  expect(admins[1].googleId).toBe(user2.googleId);
});

test('Remove Admin From Session', async () => {
  const session = await SessionsRepo.removeUserBySessionId(id, user2, 'admin');
  const admins = session.admins;
  expect(admins.length).toEqual(1);
  expect(admins[0].googleId).toBe(user.googleId);
  id = session.id;
  expect(await SessionsRepo.isAdmin(id, user2)).toBe(false);
  expect(await SessionsRepo.isAdmin(id, user)).toBe(true);
});

test('Add Admin To Session By GoogleId', async () => {
  const admins = (await SessionsRepo.addUsersByGoogleIds(id, [user2.googleId], 'admin')).admins;
  expect(admins.length).toEqual(2);
  expect(admins[1].googleId).toBe(user2.googleId);

  const session = await SessionsRepo.removeUserBySessionId(id, user2, 'admin');
  id = session.id;
});

test('Add Member To Session By GoogleId', async () => {
  const members =
    (await SessionsRepo.addUsersByGoogleIds(id, [user2.googleId], 'member')).members;
  expect(members.length).toEqual(1);
  expect(members[0].googleId).toBe(user2.googleId);
});

test('Get Members Of Session', async () => {
  const members = await SessionsRepo.getUsersBySessionId(id, 'member');
  expect(members.length).toEqual(1);
  expect(members[0].googleId).toBe(user2.googleId);
});

test('Get Members And Admins Of Session', async () => {
  const users = await SessionsRepo.getUsersBySessionId(id);
  expect(users.length).toEqual(2);
  expect(users[0].id).toBe(user.id);
  expect(users[1].id).toBe(user2.id);
});

test('Remove Member From Session', async () => {
  const session = await SessionsRepo.removeUserBySessionId(id, user2, 'member');
  const members = session.members;
  expect(members.length).toEqual(0);
  id = session.id;
});

test('Add Members To Session By Id', async () => {
  var members =
    (await SessionsRepo.addUsersByIds(id, [user2.id], 'member')).members;
  expect(members.length).toEqual(1);
  expect(members[0].googleId).toBe(user2.googleId);

  const user3 = await UsersRepo.createDummyUser('sessiontest3');
  members =
    (await SessionsRepo.addUsersByIds(id, [user3.id], 'member')).members;
  expect(members.length).toEqual(2);
  expect(members[1].googleId).toBe(user3.googleId);

  var session = await SessionsRepo.removeUserBySessionId(id, user2, 'member');
  session = await SessionsRepo.removeUserBySessionId(id, user3, 'member');
  id = session.id;
});

test('Delete Session', async () => {
  await SessionsRepo.deleteSessionById(id);
  expect(await SessionsRepo.getSessionById(id)).not.toBeDefined();
});

// Teardown
afterAll(async () => {
  await UsersRepo.deleteUserById(user.id);
  await UsersRepo.deleteUserById(user2.id);
  console.log('Passed all session tests');
});
