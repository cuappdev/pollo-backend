import GroupsRepo from '../../src/repos/GroupsRepo';
import UsersRepo from '../../src/repos/UsersRepo';
import PollsRepo from '../../src/repos/PollsRepo';
import QuestionsRepo from '../../src/repos/QuestionsRepo';
import dbConnection from '../../src/db/DbConnection';

let code;
let code2;
let uuid;
let uuid2;
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
  ({ uuid } = group);

  const group2 = await GroupsRepo.createGroup('NewGroup', code2);
  expect(group2.admins.length).toEqual(0);
  expect(group.members.length).toEqual(0);
  uuid2 = group2.uuid;
});

test('Get Group by ID', async () => {
  const group = await GroupsRepo.getGroupByID(uuid);
  expect(group.name).toBe('Group');
  expect(group.code).toBe(code);

  const group2 = await GroupsRepo.getGroupByID(uuid2);
  expect(group2.name).toBe('NewGroup');
  expect(group2.code).toBe(code2);
});

test('Get Group by Code', async () => {
  const tempid = await GroupsRepo.getGroupID(code);
  expect(tempid).toBe(uuid);
});

test('Update Group', async () => {
  const group = await GroupsRepo.updateGroupByID(uuid, 'Update Group', null, true, false);
  expect(group.uuid).toBe(uuid);
  expect(group.name).toBe('Update Group');
  expect(group.isLocationRestricted).toBe(true);
  expect(group.isFilterActivated).toBe(false);
});

test('Get Admins from Group', async () => {
  const admins = await GroupsRepo.getUsersByGroupID(uuid, 'admin');
  expect(admins.length).toEqual(1);
  expect(admins[0].googleID).toBe(user.googleID);

  const admins2 = await GroupsRepo.getUsersByGroupID(uuid2, 'admin');
  expect(admins2.length).toEqual(0);
});

test('Add Admin to Group by ID', async () => {
  user2 = await UsersRepo.createDummyUser('grouptest2');
  user3 = await UsersRepo.createDummyUser('grouptest3');
  user4 = await UsersRepo.createDummyUser('grouptest4');

  const { admins } = await GroupsRepo.addUsersByIDs(uuid, [user2.uuid], 'admin');
  expect(admins.length).toEqual(2);
  expect(admins[1].googleID).toBe(user2.googleID);

  const group = await GroupsRepo.addUsersByIDs(uuid2, [user3.uuid, user4.uuid], 'admin');
  expect(group.admins.length).toEqual(2);
  expect(group.admins[0].googleID).toBe(user3.googleID);
  expect(group.admins[1].googleID).toBe(user4.googleID);
});

test('Remove Admin from Group', async () => {
  const group = await GroupsRepo.removeUserByGroupID(uuid, user2, 'admin');
  expect(group.admins.length).toEqual(1);
  expect(group.admins[0].googleID).toBe(user.googleID);
  ({ uuid } = group);

  expect(await GroupsRepo.isAdmin(uuid, user2)).toBe(false);
  expect(await GroupsRepo.isMember(uuid, user2)).toBe(false);
  expect(await GroupsRepo.isAdmin(uuid, user)).toBe(true);
  expect(await GroupsRepo.isMember(uuid, user)).toBe(false);

  await GroupsRepo.removeUserByGroupID(uuid2, user3, 'admin');
  const group2 = await GroupsRepo.removeUserByGroupID(uuid2, user4, 'admin');
  expect(group2.admins.length).toEqual(0);
});

test('Add Admin to Group by GoogleID', async () => {
  const { admins } = (await GroupsRepo.addUsersByGoogleIDs(uuid, [user2.googleID], 'admin'));
  expect(admins.length).toEqual(2);
  expect(admins[1].uuid).toBe(user2.uuid);

  const group = await GroupsRepo.removeUserByGroupID(uuid, user2, 'admin');
  expect(group.admins.length).toEqual(1);
  ({ uuid } = group);

  const googleIDs = [user3.googleID, user4.googleID];
  let group2 = await GroupsRepo.addUsersByGoogleIDs(uuid2, googleIDs, 'admin');
  expect(group2.admins.length).toEqual(2);
  expect(group2.admins[0].uuid).toBe(user3.uuid);
  expect(group2.admins[1].uuid).toBe(user4.uuid);

  await GroupsRepo.removeUserByGroupID(uuid2, user3, 'admin');
  group2 = await GroupsRepo.removeUserByGroupID(uuid2, user4, 'admin');
  expect(group2.admins.length).toEqual(0);
});

test('Add Member to Group by GoogleID', async () => {
  const { members } = (await GroupsRepo.addUsersByGoogleIDs(uuid, [user2.googleID], 'member'));
  expect(members.length).toEqual(1);
  expect(members[0].uuid).toBe(user2.uuid);

  const group = await GroupsRepo.addUsersByGoogleIDs(uuid2, [user3.googleID, user4.googleID]);
  expect(group.members.length).toEqual(2);
  expect(group.members[0].uuid).toBe(user3.uuid);
  expect(group.members[1].uuid).toBe(user4.uuid);
});

test('Get Members of Group', async () => {
  const members = await GroupsRepo.getUsersByGroupID(uuid, 'member');
  expect(members.length).toEqual(1);
  expect(members[0].googleID).toBe(user2.googleID);

  const members2 = await GroupsRepo.getUsersByGroupID(uuid2, 'member');
  expect(members2.length).toEqual(2);
  expect(members2[0].uuid).toBe(user3.uuid);
  expect(members2[1].uuid).toBe(user4.uuid);
});

test('Get All Users of Group', async () => {
  const users = await GroupsRepo.getUsersByGroupID(uuid);
  expect(users.length).toEqual(2);
  expect(users[0].uuid).toBe(user.uuid);
  expect(users[1].uuid).toBe(user2.uuid);

  const users2 = await GroupsRepo.getUsersByGroupID(uuid2);
  expect(users2.length).toEqual(2);
});

test('Remove Member from Group', async () => {
  const group = await GroupsRepo.removeUserByGroupID(uuid, user2, 'member');
  expect(group.members.length).toEqual(0);
  ({ uuid } = group);

  await GroupsRepo.removeUserByGroupID(uuid2, user3, 'member');
  const group2 = await GroupsRepo.removeUserByGroupID(uuid2, user4);
  expect(group2.members.length).toEqual(0);
});

test('Add Members to Group by ID', async () => {
  let { members } = (await GroupsRepo.addUsersByIDs(uuid, [user2.uuid], 'member'));
  expect(members.length).toEqual(1);
  expect(members[0].googleID).toBe(user2.googleID);

  ({ members } = await GroupsRepo.addUsersByIDs(uuid, [user3.uuid, user4.uuid]));
  expect(members.length).toEqual(3);

  let group = await GroupsRepo.removeUserByGroupID(uuid, user3, 'member');
  group = await GroupsRepo.removeUserByGroupID(uuid, user4, 'member');
  ({ uuid } = group);
});

test('Get Polls from Group', async () => {
  const group = await GroupsRepo.getGroupByID(uuid);
  let polls = await GroupsRepo.getPolls(uuid);
  expect(polls.length).toEqual(0);

  const answerChoices1 = [{ letter: 'A', text: 'blue', count: 1 }];
  const answerChoices2 = [{ text: 'blue', count: 0 }, { text: 'red', count: 2 }];
  const answerChoices1WithoutCounts = [{ letter: 'A', text: 'blue' }];

  const poll = await PollsRepo.createPoll('Poll', group, answerChoices1, 'multipleChoice', '', null, 'ended');
  const poll2 = await PollsRepo.createPoll('', group, answerChoices2, 'freeResponse', '', null, 'ended');
  polls = await GroupsRepo.getPolls(uuid);
  expect(polls.length).toEqual(2);
  expect(polls[0].uuid).toBe(poll.uuid);
  expect(polls[1].uuid).toBe(poll2.uuid);
  expect(polls[0].answerChoices).toEqual(answerChoices1WithoutCounts);// if member, hide results
  expect(polls[1].answerChoices).toEqual(answerChoices2);
  polls = await GroupsRepo.getPolls(uuid, false); // if admin, don't hide results
  expect(polls[0].answerChoices).toEqual(answerChoices1);
  expect(polls[1].answerChoices).toEqual(answerChoices2);

  await PollsRepo.deletePollByID(poll.uuid);
  await PollsRepo.deletePollByID(poll2.uuid);
});

test('Get Questions from Group', async () => {
  const group = await GroupsRepo.getGroupByID(uuid);
  let questions = await GroupsRepo.getQuestions(uuid);
  expect(questions.length).toEqual(0);

  const question1 = await QuestionsRepo.createQuestion('Question1', group, user);
  const question2 = await QuestionsRepo.createQuestion('Question2', group, user2);
  questions = await GroupsRepo.getQuestions(uuid);
  expect(questions.length).toEqual(2);

  await QuestionsRepo.deleteQuestionByID(question1.uuid);
  await QuestionsRepo.deleteQuestionByID(question2.uuid);
});

test('Delete Group', async () => {
  await GroupsRepo.deleteGroupByID(uuid);
  await GroupsRepo.deleteGroupByID(uuid2);
  expect(await GroupsRepo.getGroupByID(uuid)).not.toBeDefined();
  expect(await GroupsRepo.getGroupByID(uuid2)).not.toBeDefined();
});

// Teardown
afterAll(async () => {
  await UsersRepo.deleteUserByID(user.uuid);
  await UsersRepo.deleteUserByID(user2.uuid);
  await UsersRepo.deleteUserByID(user3.uuid);
  await UsersRepo.deleteUserByID(user4.uuid);
  // eslint-disable-next-line no-console
  console.log('Passed all group tests');
});
