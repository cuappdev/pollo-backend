import SessionsRepo from '../../src/repos/SessionsRepo';
import dbConnection from '../../src/db/DbConnection';
import GroupsRepo from '../../src/repos/GroupsRepo';
import UsersRepo from '../../src/repos/UsersRepo';

// Global group info
var groupId;
var groupCode;
// Admin stuff
var user1;
var user2;
// Session info
var sessionOneCode;
var sessionOne;
var sessionTwoCode;
var sessionTwo;

beforeAll(async () => {
  await dbConnection().catch(function (e) {
    console.log('Error connecting to database');
    process.exit();
  });
  groupCode = GroupsRepo.createCode();
  sessionOneCode = SessionsRepo.createCode();
  sessionTwoCode = SessionsRepo.createCode();
  user1 = await UsersRepo.createDummyUser('grouptest1');
  user2 = await UsersRepo.createDummyUser('grouptest2');
  sessionOne = await SessionsRepo.createSession('Session1', sessionOneCode, user1);
  sessionTwo = await SessionsRepo.createSession('Session2', sessionTwoCode, user1);
});

test('Create Group', async () => {
  const group =
    await GroupsRepo.createGroup('Group', groupCode, user1, sessionOne);

  expect(group.name).toBe('Group');
  expect(group.admins.length).toBe(1);
  expect(group.members.length).toBe(0);
  expect(group.sessions.length).toBe(1);
  expect(group.sessions[0].code).toBe('');

  groupId = group.id;
});

test('Update Group', async () => {
  const group = await GroupsRepo.updateGroupById(groupId, 'New Group Name');
  expect(group.id).toBe(groupId);
  expect(group.name).toBe('New Group Name');
});

test('Add Member To Group', async () => {
  await GroupsRepo.addUsers(groupId, [user1.id], 'member');
  const members = await GroupsRepo.getUsersByGroupId(groupId, 'member');
  const admins = await GroupsRepo.getUsersByGroupId(groupId, 'admin');
  expect(members.length).toBe(1);
  expect(members[0].id).toBe(user1.id);
  expect(admins.length).toBe(1);
});

test('Add Admin To Group', async () => {
  await GroupsRepo.addUsers(groupId, [user2.id], 'admin');
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
  await GroupsRepo.removeUsers(groupId, [user1.id], 'member');
  const members = await GroupsRepo.getUsersByGroupId(groupId, 'member');
  const admins = await GroupsRepo.getUsersByGroupId(groupId, 'admin');
  expect(members.length).toBe(0);
  expect(admins.length).toBe(2);
});

test('Remove Admin From Group', async () => {
  await GroupsRepo.removeUsers(groupId, [user2.id], 'admin');
  const isAdmin = await GroupsRepo.isAdmin(groupId, user2);
  const members = await GroupsRepo.getUsersByGroupId(groupId, 'member');
  const admins = await GroupsRepo.getUsersByGroupId(groupId, 'admin');
  expect(isAdmin).toBe(false);
  expect(members.length).toBe(0);
  expect(admins.length).toBe(1);
});

test('Add Session To Group', async () => {
  await GroupsRepo.addSessionByGroupId(groupId, sessionTwo);
  const sessions = await GroupsRepo.getSessionsById(groupId);
  expect(sessions.length).toBe(2);
  expect(sessions[0].id).toBe(sessionOne.id);
  expect(sessions[1].id).toBe(sessionTwo.id);
});

test('Remove Session From Group', async () => {
  await GroupsRepo.removeSessionByGroupId(groupId, sessionOne);
  const sessions = await GroupsRepo.getSessionsById(groupId);
  expect(sessions.length).toBe(1);
  expect(sessions[0].id).toBe(sessionTwo.id);
});

test('Delete group', async () => {
  await SessionsRepo.deleteSessionById(sessionOne.id);
  await SessionsRepo.deleteSessionById(sessionTwo.id);
  await GroupsRepo.deleteGroupById(groupId);
  expect(await GroupsRepo.getGroupById(groupId)).not.toBeDefined();
});

// Teardown
afterAll(async () => {
  await UsersRepo.deleteUserById(user1.id);
  await UsersRepo.deleteUserById(user2.id);
  console.log('Passed all group tests');
});
