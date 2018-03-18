import PollsRepo from '../../src/repos/PollsRepo';
import UsersRepo from '../../src/repos/UsersRepo';
import dbConnection from '../../src/db/DbConnection';

var id;
var poll;
const googleId = 'usertest1';

// Connects to db before running tests and does setup
beforeAll(async () => {
  await dbConnection().catch(function (e) {
    console.log('Error connecting to database');
    process.exit();
  });
});

test('Create User', async () => {
  const user = await UsersRepo.createDummyUser(googleId);
  expect(user.googleId).toBe(googleId);
  expect(user.netId).toBe('');
  id = user.id;
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
  const user = users[0];
  expect(users.length).toEqual(1);
  expect(user.id).toBe(id);
  expect(user.googleId).toBe(googleId);
});

test('Get Polls', async () => {
  const user = await UsersRepo.getUserById(id);
  const code = await PollsRepo.createCode();
  poll = await PollsRepo.createPoll('name', code, user);
  const adminPolls = await UsersRepo.getPollsById(id, 'admin');
  const memberPolls = await UsersRepo.getPollsById(id, 'member');
  expect(adminPolls.length).toEqual(1);
  expect(memberPolls.length).toEqual(0);
  expect(adminPolls[0].id).toBe(poll.id);
  await PollsRepo.deletePollById(poll.id);
});

test('Delete User', async () => {
  await UsersRepo.deleteUserById(id);
  expect(await UsersRepo.getUserById(id)).not.toBeDefined();
});

// Teardown
afterAll(async () => {
  console.log('Passed all tests');
});
