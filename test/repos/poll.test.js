import GroupsRepo from '../../src/repos/GroupsRepo';
import PollsRepo from '../../src/repos/PollsRepo';
import UsersRepo from '../../src/repos/UsersRepo';
import dbConnection from '../../src/db/DbConnection';

let uuid;
let uuid2;
let group;
let group2;
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
  group2 = await GroupsRepo
    .createGroup('Group2', GroupsRepo.createCode(), user);
});

test('Create Poll', async () => {
  const poll = await PollsRepo
    .createPoll('Poll', group, [], 'multipleChoice', 'A', null, 'shared', {});
  expect(poll.text).toBe('Poll');
  expect(poll.group.uuid).toBe(group.uuid);
  expect(poll.answerChoices).toEqual([]);
  expect(poll.type).toBe('multipleChoice');
  expect(poll.correctAnswer).toBe('A');
  expect(poll.state).toBe('shared');
  expect(poll.answers).toEqual({});
  expect(poll.upvotes).toEqual({});
  ({ uuid } = poll);

  const poll2 = await PollsRepo.createPoll('', group, [], 'freeResponse', null, {}, 'ended', {});
  expect(poll2.text).toBe('');
  expect(poll2.group.uuid).toBe(group.uuid);
  expect(poll2.answerChoices).toEqual([]);
  expect(poll2.type).toBe('freeResponse');
  expect(poll2.correctAnswer).toBe('');
  expect(poll2.state).toBe('ended');
  expect(poll2.answers).toEqual({});
  expect(poll2.upvotes).toEqual({});
  uuid2 = poll2.uuid;
});

test('Get Poll', async () => {
  const poll = await PollsRepo.getPollByID(uuid);
  expect(poll.text).toBe('Poll');
  expect(poll.state).toBe('shared');
  expect(poll.type).toBe('multipleChoice');

  const poll2 = await PollsRepo.getPollByID(uuid2);
  expect(poll2.text).toBe('');
  expect(poll2.state).toBe('ended');
  expect(poll2.type).toBe('freeResponse');
});

test('Update Poll', async () => {
  const poll = await PollsRepo.updatePollByID(uuid, 'New Poll', null, null, null, 'ended');
  expect(poll.text).toBe('New Poll');
  expect(poll.state).toBe('ended');

  const poll2 = await PollsRepo.updatePollByID(uuid2, '', null, { user: 'answer' });
  expect(poll2.text).toBe('');
  expect(poll2.answers.user).toBe('answer');
});

test('Get Group from Poll', async () => {
  const p = await PollsRepo.getGroupFromPollID(uuid);
  expect(p.uuid).toBe(group.uuid);
});

test('Get Polls from Group', async () => {
  await PollsRepo
    .createPoll('Another poll', group, [], 'freeResponse', null, null, 'ended', null);
  const polls = await GroupsRepo.getPolls(group.uuid);
  expect(polls.length).toBe(3);
});

test('Delete Poll', async () => {
  await PollsRepo.deletePollByID(uuid);
  await PollsRepo.deletePollByID(uuid2);
  expect(await PollsRepo.getPollByID(uuid)).not.toBeDefined();
  expect(await PollsRepo.getPollByID(uuid2)).not.toBeDefined();
});

// Teardown
afterAll(async () => {
  await GroupsRepo.deleteGroupByID(group.uuid);
  await GroupsRepo.deleteGroupByID(group2.uuid);
  await UsersRepo.deleteUserByID(user.uuid);
  // eslint-disable-next-line no-console
  console.log('Passed all poll tests');
});
