import GroupsRepo from '../../src/repos/GroupsRepo';
import PollsRepo from '../../src/repos/PollsRepo';
import UsersRepo from '../../src/repos/UsersRepo';
import dbConnection from '../../src/db/DbConnection';

let uuid;
let group;
let user;

// Connects to db before running tests and does setup
beforeAll(async () => {
  await dbConnection().catch((e) => {
    // eslint-disable-next-line no-console
    console.log('Error connecting to database');
    process.exit();
  });
  user = await UsersRepo.createDummyUser('1234');
  group = await GroupsRepo
    .createGroup('Group', GroupsRepo.createCode(), user);
});

test('Create Poll', async () => {
  const poll = await PollsRepo
    .createPoll('Poll', group, [], 'A', null, 'shared');
  expect(poll.text).toBe('Poll');
  expect(poll.group.uuid).toBe(group.uuid);
  expect(poll.answerChoices).toEqual([]);
  expect(poll.correctAnswer).toBe('A');
  expect(poll.state).toBe('shared');
  expect(poll.answers).toEqual({});
  ({ uuid } = poll);
});

test('Get Poll', async () => {
  const poll = await PollsRepo.getPollByID(uuid);
  expect(poll.text).toBe('Poll');
  expect(poll.state).toBe('shared');
});

test('Update Poll', async () => {
  const poll = await PollsRepo.updatePollByID(uuid, 'New Poll', null, null, 'ended');
  expect(poll.text).toBe('New Poll');
  expect(poll.state).toBe('ended');
});

test('Get Group from Poll', async () => {
  const p = await PollsRepo.getGroupFromPollID(uuid);
  expect(p.uuid).toBe(group.uuid);
});

test('Get Polls from Group', async () => {
  await PollsRepo
    .createPoll('Another poll', group, [], null, null, 'ended');
  const polls = await GroupsRepo.getPolls(group.uuid);
  expect(polls.length).toBe(2);
});

test('Delete Poll', async () => {
  await PollsRepo.deletePollByID(uuid);
  expect(await PollsRepo.getPollByID(uuid)).not.toBeDefined();
});

// Teardown
afterAll(async () => {
  await GroupsRepo.deleteGroupByID(group.uuid);
  await UsersRepo.deleteUserByID(user.uuid);
  // eslint-disable-next-line no-console
  console.log('Passed all poll tests');
});
