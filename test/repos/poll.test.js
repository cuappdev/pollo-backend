import PollsRepo from '../../src/repos/PollsRepo';
import UsersRepo from '../../src/repos/UsersRepo';
import dbConnection from '../../src/db/DbConnection';

var id;
var code;
var user;
var user2;

// Connects to db before running tests and does setup
beforeAll(async () => {
  await dbConnection().catch(function (e) {
    console.log('Error connecting to database');
    process.exit();
  });
});

test('Create Poll', async () => {
  code = PollsRepo.createCode();
  user = await UsersRepo.createDummyUser('polltest1');

  const poll = await PollsRepo.createPoll('Poll', code, user);
  expect(poll.name).toBe('Poll');
  expect(poll.code).toBe(code);
  expect(poll.admins[0].googleId).toBe(user.googleId);
  id = poll.id;
});

test('Get Poll', async () => {
  const poll = await PollsRepo.getPollById(id);
  expect(poll.name).toBe('Poll');
  expect(poll.code).toBe(code);
});

test('Update Poll', async () => {
  const poll = await PollsRepo.updatePollById(id, 'New Poll');
  expect(poll.name).toBe('New Poll');
});

test('Get Admins From Poll', async () => {
  const admins = await PollsRepo.getUsersByPollId(id, 'admin');
  expect(admins.length).toEqual(1);
  expect(admins[0].googleId).toBe(user.googleId);
});

test('Add Admin To Poll', async () => {
  user2 = await UsersRepo.createDummyUser('polltest2');
  const admins = (await PollsRepo.addUserByPollId(id, user2, 'admin')).admins;
  expect(admins.length).toEqual(2);
  expect(admins[1].googleId).toBe(user2.googleId);
});

test('Remove Admin From Poll', async () => {
  const poll = await PollsRepo.removeUserByPollId(id, user2, 'admin');
  const admins = poll.admins;
  expect(admins.length).toEqual(1);
  expect(admins[0].googleId).toBe(user.googleId);
  id = poll.id;
  expect(await PollsRepo.isAdmin(id, user2)).toBe(false);
  expect(await PollsRepo.isAdmin(id, user)).toBe(true);
});

test('Add Member To Poll', async () => {
  const members = (await PollsRepo.addUserByPollId(id, user2, 'member')).members;
  expect(members.length).toEqual(1);
  expect(members[0].googleId).toBe(user2.googleId);
});

test('Get Members Of Poll', async () => {
  const members = await PollsRepo.getUsersByPollId(id, 'member');
  expect(members.length).toEqual(1);
  expect(members[0].googleId).toBe(user2.googleId);
});

test('Remove Member From Poll', async () => {
  const poll = await PollsRepo.removeUserByPollId(id, user2, 'member');
  const members = poll.members;
  expect(members.length).toEqual(0);
  id = poll.id;
});

test('Delete Poll', async () => {
  await PollsRepo.deletePollById(id);
  await UsersRepo.deleteUserById(user.id);
  await UsersRepo.deleteUserById(user2.id);
  expect(await UsersRepo.getUserById(user.id)).not.toBeDefined();
  expect(await UsersRepo.getUserById(user2.id)).not.toBeDefined();
  expect(await PollsRepo.getPollById(id)).not.toBeDefined();
});

// Teardown
afterAll(async () => {
  console.log('Passed all tests');
  await UsersRepo.deleteUserById(user.id);
  await UsersRepo.deleteUserById(user2.id);
});
