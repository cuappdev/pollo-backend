import PollsRepo from '../../src/repos/PollsRepo';
import UsersRepo from '../../src/repos/UsersRepo';
import dbConnection from '../../src/db/DbConnection';
import User from '../../src/models/User';

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
  user = await UsersRepo.createDummyUser('1234');

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
  const admins = await PollsRepo.getAdminsByPollId(id);
  expect(admins.length).toEqual(1);
  expect(admins[0].googleId).toBe(user.googleId);
});

test('Add Admins To Poll', async () => {
  user2 = await UsersRepo.createDummyUser('5678');
  const admins = await PollsRepo.addAdminByPollId(id, user2);
  expect(admins.length).toEqual(2);
  expect(admins[1].googleId).toBe(user2.googleId);
});

test('Remove Admins From Poll', async () => {
  const admins = await PollsRepo.removeAdminByPollId(id, user2);
  expect(admins.length).toEqual(1);
  expect(admins[0].googleId).toBe(user.googleId);
});

test('Delete Poll', async () => {
  await PollsRepo.deletePollById(id);
  expect(await PollsRepo.getPollById(id)).not.toBeDefined();
});

// Teardown
afterAll(async () => {
  console.log('Passed all tests');
});
