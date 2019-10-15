import GroupsRepo from '../../src/repos/GroupsRepo';
import UsersRepo from '../../src/repos/UsersRepo';
import PollsRepo from '../../src/repos/PollsRepo';
import dbConnection from '../../src/db/DbConnection';

let code;
let code2;
let id;
let id2;
let user;
let user2;
let user3;
let user4;

// Connects to db before running tests and does setup
beforeAll(async () => {
  await dbConnection().catch((e) => {
    // eslint-disable-next-line no-console
    console.log('Error connecting to database');
    process.exit();
  });
});

test('Create Group', async () => {
  code = GroupsRepo.createCode();
  code2 = GroupsRepo.createCode();
  user = await UsersRepo.createDummyUser('grouptest1');

  const group = await GroupsRepo.createGroup('Group', code, user);
  expect(group.name).toBe('Group');
  expect(group.code).toBe(code);
  expect(group.admins.length).toEqual(1);
  expect(group.admins[0].googleID).toBe(user.googleID);
  expect(group.members.length).toEqual(0);
  ({ id } = group);

  const group2 = await GroupsRepo.createGroup('NewGroup', code2);
  expect(group2.admins.length).toEqual(0);
  expect(group.members.length).toEqual(0);
  id2 = group2.id;
});

test('Get Group by ID', async () => {
  const group = await GroupsRepo.getGroupByID(id);
  expect(group.name).toBe('Group');
  expect(group.code).toBe(code);

  const group2 = await GroupsRepo.getGroupByID(id2);
  expect(group2.name).toBe('NewGroup');
  expect(group2.code).toBe(code2);
});

test('Get Group by Code', async () => {
  const tempid = await GroupsRepo.getGroupID(code);
  expect(tempid).toBe(id);
});

test('Update Group', async () => {
  const group = await GroupsRepo.updateGroupByID(id, 'Update Group', null, true, false);
  expect(group.id).toBe(id);
  expect(group.name).toBe('Update Group');
  expect(group.isLocationRestricted).toBe(true);
  expect(group.isFilterActivated).toBe(false);
});

test('Get Admins from Group', async () => {
  const admins = await GroupsRepo.getUsersByGroupID(id, 'admin');
  expect(admins.length).toEqual(1);
  expect(admins[0].googleID).toBe(user.googleID);

  const admins2 = await GroupsRepo.getUsersByGroupID(id2, 'admin');
  expect(admins2.length).toEqual(0);
});

test('Add Admin to Group by ID', async () => {
  user2 = await UsersRepo.createDummyUser('grouptest2');
  user3 = await UsersRepo.createDummyUser('grouptest3');
  user4 = await UsersRepo.createDummyUser('grouptest4');

  const { admins } = await GroupsRepo.addUsersByIDs(id, [user2.id], 'admin');
  expect(admins.length).toEqual(2);
  expect(admins[1].googleID).toBe(user2.googleID);

  const group = await GroupsRepo.addUsersByIDs(id2, [user3.id, user4.id], 'admin');
  expect(group.admins.length).toEqual(2);
  expect(group.admins[0].googleID).toBe(user3.googleID);
  expect(group.admins[1].googleID).toBe(user4.googleID);
});

test('Remove Admin from Group', async () => {
  const group = await GroupsRepo.removeUserByGroupID(id, user2, 'admin');
  expect(group.admins.length).toEqual(1);
  expect(group.admins[0].googleID).toBe(user.googleID);
  ({ id } = group);

  expect(await GroupsRepo.isAdmin(id, user2)).toBe(false);
  expect(await GroupsRepo.isMember(id, user2)).toBe(false);
  expect(await GroupsRepo.isAdmin(id, user)).toBe(true);
  expect(await GroupsRepo.isMember(id, user)).toBe(false);

  await GroupsRepo.removeUserByGroupID(id2, user3, 'admin');
  const group2 = await GroupsRepo.removeUserByGroupID(id2, user4, 'admin');
  expect(group2.admins.length).toEqual(0);
});

test('Add Admin to Group by GoogleID', async () => {
  const { admins } = (await GroupsRepo.addUsersByGoogleIDs(id, [user2.googleID], 'admin'));
  expect(admins.length).toEqual(2);
  expect(admins[1].id).toBe(user2.id);

  const group = await GroupsRepo.removeUserByGroupID(id, user2, 'admin');
  expect(group.admins.length).toEqual(1);
  ({ id } = group);

  const googleIDs = [user3.googleID, user4.googleID];
  let group2 = await GroupsRepo.addUsersByGoogleIDs(id2, googleIDs, 'admin');
  expect(group2.admins.length).toEqual(2);
  expect(group2.admins[0].id).toBe(user3.id);
  expect(group2.admins[1].id).toBe(user4.id);

  await GroupsRepo.removeUserByGroupID(id2, user3, 'admin');
  group2 = await GroupsRepo.removeUserByGroupID(id2, user4, 'admin');
  expect(group2.admins.length).toEqual(0);
});

test('Add Member to Group by GoogleID', async () => {
  const { members } = (await GroupsRepo.addUsersByGoogleIDs(id, [user2.googleID], 'member'));
  expect(members.length).toEqual(1);
  expect(members[0].id).toBe(user2.id);

  const group = await GroupsRepo.addUsersByGoogleIDs(id2, [user3.googleID, user4.googleID]);
  expect(group.members.length).toEqual(2);
  expect(group.members[0].id).toBe(user3.id);
  expect(group.members[1].id).toBe(user4.id);
});

test('Get Members of Group', async () => {
  const members = await GroupsRepo.getUsersByGroupID(id, 'member');
  expect(members.length).toEqual(1);
  expect(members[0].googleID).toBe(user2.googleID);

  const members2 = await GroupsRepo.getUsersByGroupID(id2, 'member');
  expect(members2.length).toEqual(2);
  expect(members2[0].id).toBe(user3.id);
  expect(members2[1].id).toBe(user4.id);
});

test('Get All Users of Group', async () => {
  const users = await GroupsRepo.getUsersByGroupID(id);
  expect(users.length).toEqual(2);
  expect(users[0].id).toBe(user.id);
  expect(users[1].id).toBe(user2.id);

  const users2 = await GroupsRepo.getUsersByGroupID(id2);
  expect(users2.length).toEqual(2);
});

test('Remove Member from Group', async () => {
  const group = await GroupsRepo.removeUserByGroupID(id, user2, 'member');
  expect(group.members.length).toEqual(0);
  ({ id } = group);

  await GroupsRepo.removeUserByGroupID(id2, user3, 'member');
  const group2 = await GroupsRepo.removeUserByGroupID(id2, user4);
  expect(group2.members.length).toEqual(0);
});

test('Add Members to Group by ID', async () => {
  let { members } = (await GroupsRepo.addUsersByIDs(id, [user2.id], 'member'));
  expect(members.length).toEqual(1);
  expect(members[0].googleID).toBe(user2.googleID);

  ({ members } = await GroupsRepo.addUsersByIDs(id, [user3.id, user4.id]));
  expect(members.length).toEqual(3);

  let group = await GroupsRepo.removeUserByGroupID(id, user3, 'member');
  group = await GroupsRepo.removeUserByGroupID(id, user4, 'member');
  ({ id } = group);
});

test('Get Polls from Group', async () => {
  const group = await GroupsRepo.getGroupByID(id);
  let polls = await GroupsRepo.getPolls(id);
  expect(polls.length).toEqual(0);

  const answerChoices1 = [{ letter: 'A', text: 'blue', count: 1 }];
  const answerChoices2 = [{ text: 'blue', count: 0 }, { text: 'red', count: 2 }];
  const answerChoices1WithoutCounts = [{ letter: 'A', text: 'blue' }];

  const poll = await PollsRepo.createPoll('Poll', group, answerChoices1, 'multipleChoice', '', null, 'ended');
  const poll2 = await PollsRepo.createPoll('', group, answerChoices2, 'freeResponse', '', null, 'ended');
  polls = await GroupsRepo.getPolls(id);
  expect(polls.length).toEqual(2);
  expect(polls[0].id).toBe(poll.id);
  expect(polls[1].id).toBe(poll2.id);
  expect(polls[0].answerChoices).toEqual(answerChoices1WithoutCounts);// if member, hide results
  expect(polls[1].answerChoices).toEqual(answerChoices2);
  polls = await GroupsRepo.getPolls(id, false); // if admin, don't hide results
  expect(polls[0].answerChoices).toEqual(answerChoices1);
  expect(polls[1].answerChoices).toEqual(answerChoices2);

  await PollsRepo.deletePollByID(poll.id);
  await PollsRepo.deletePollByID(poll2.id);
});

test('Delete Group', async () => {
  await GroupsRepo.deleteGroupByID(id);
  await GroupsRepo.deleteGroupByID(id2);
  expect(await GroupsRepo.getGroupByID(id)).not.toBeDefined();
  expect(await GroupsRepo.getGroupByID(id2)).not.toBeDefined();
});

// Teardown
afterAll(async () => {
  await UsersRepo.deleteUserByID(user.id);
  await UsersRepo.deleteUserByID(user2.id);
  await UsersRepo.deleteUserByID(user3.id);
  await UsersRepo.deleteUserByID(user4.id);
  // eslint-disable-next-line no-console
  console.log('Passed all group tests');
});
