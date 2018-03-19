import PollsRepo from '../../src/repos/PollsRepo';
import dbConnection from '../../src/db/DbConnection';
import GroupsRepo from '../../src/repos/GroupsRepo';
import UsersRepo from '../../src/repos/UsersRepo';

// Global group info
var groupId;
var groupCode;
// Admin stuff
var user1;
var user2
// Poll info
var pollOneCode;
var pollOne;
var pollTwoCode;
var pollTwo;

beforeAll(async () => {
  await dbConnection().catch(function (e) {
    console.log('Error connecting to database');
    process.exit();
  });
  groupCode = GroupsRepo.createCode();
  pollOneCode = PollsRepo.createCode();
  pollTwoCode = PollsRepo.createCode();
  user1 = await UsersRepo.createDummyUser('grouptest1');
  user2 = await UsersRepo.createDummyUser('grouptest2');
  pollOne = await PollsRepo.createPoll('Poll1', pollOneCode, user1);
  pollTwo = await PollsRepo.createPoll('Poll2', pollTwoCode, user1);
});

test('Create Group', async () => {
  const group = await GroupsRepo.createGroup('Group', groupCode, user1, pollOne);

  expect(group.name).toBe('Group');
  expect(group.admins.length).toBe(1);
  expect(group.members.length).toBe(0);
  expect(group.polls.length).toBe(1);
  expect(group.polls[0].code).toBe('');

  groupId = group.id;
});

test('Update Group', async () => {
  const group = await GroupsRepo.updateGroupById(groupId, 'New Group Name');
  expect(group.id).toBe(groupId);
  expect(group.name).toBe('New Group Name');
});

test('Add Member To Group', async () => {
  const group = await GroupsRepo.addUserByGroupId(groupId, user1, 'member');
  const members = await GroupsRepo.getUsersByGroupId(groupId, 'member');
  const admins = await GroupsRepo.getUsersByGroupId(groupId, 'admin');
  expect(members.length).toBe(1);
  expect(members[0].id).toBe(user1.id);
  expect(admins.length).toBe(1);
});

test('Add Admin To Group', async () => {
  const group = await GroupsRepo.addUserByGroupId(groupId, user2, 'admin');
  const isAdmin = await GroupsRepo.isAdmin(groupId, user2);
  const members = await GroupsRepo.getUsersByGroupId(groupId, 'member');
  const admins = await GroupsRepo.getUsersByGroupId(groupId, 'admin');
  expect(isAdmin).toBe(true);
  expect(admins.length).toBe(2);
  expect(admins[0].id).toBe(user1.id);
  expect(admins[1].id).toBe(user2.id);
  expect(members.length).toBe(1);
});

test('Remove Member From Group', async () => {
  const group = await GroupsRepo.removeUserByGroupId(groupId, user1, 'member');
  const members = await GroupsRepo.getUsersByGroupId(groupId, 'member');
  const admins = await GroupsRepo.getUsersByGroupId(groupId, 'admin');
  expect(members.length).toBe(0);
  expect(admins.length).toBe(2);
});

test('Remove Admin From Group', async () => {
  const group = await GroupsRepo.removeUserByGroupId(groupId, user2, 'admin');
  const isAdmin = await GroupsRepo.isAdmin(groupId, user2);
  const members = await GroupsRepo.getUsersByGroupId(groupId, 'member');
  const admins = await GroupsRepo.getUsersByGroupId(groupId, 'admin');
  expect(isAdmin).toBe(false);
  expect(members.length).toBe(0);
  expect(admins.length).toBe(1);
});

test('Add Poll To Group', async () => {
  const group = await GroupsRepo.addPollByGroupId(groupId, pollTwo);
  const polls = await GroupsRepo.getPollsById(groupId);
  expect(polls.length).toBe(2);
  expect(polls[0].id).toBe(pollOne.id);
  expect(polls[1].id).toBe(pollTwo.id);
});

test('Remove Poll From Group', async () => {
  const group = await GroupsRepo.removePollByGroupId(groupId, pollOne);
  const polls = await GroupsRepo.getPollsById(groupId);
  expect(polls.length).toBe(1);
  expect(polls[0].id).toBe(pollTwo.id);
});

test('Remove test data', async () => {
  await UsersRepo.deleteUserById(user1.id);
  await UsersRepo.deleteUserById(user2.id);
  await GroupsRepo.deleteGroupById(groupId);
  await PollsRepo.deletePollById(pollOne.id);
  await PollsRepo.deletePollById(pollTwo.id)
  expect(await UsersRepo.getUserById(user1.id)).not.toBeDefined();
  expect(await UsersRepo.getUserById(user2.id)).not.toBeDefined();
  expect(await GroupsRepo.getGroupById(groupId)).not.toBeDefined();
  expect(await PollsRepo.getPollById(pollOne.id)).not.toBeDefined();
  expect(await PollsRepo.getPollById(pollTwo.id)).not.toBeDefined();
});

// Teardown
afterAll(async () => {
  console.log('Passed all tests');
});
