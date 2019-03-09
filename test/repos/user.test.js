import GroupsRepo from '../../src/repos/GroupsRepo';
import UsersRepo from '../../src/repos/UsersRepo';
import dbConnection from '../../src/db/DbConnection';
import AppDevUtils from '../../src/utils/AppDevUtils';

let id;
let id2;
const googleID = AppDevUtils.randomCode(6);
const googleID2 = AppDevUtils.randomCode(6);
let group;
let group2;

// Connects to db before running tests and does setup
beforeAll(async () => {
  await dbConnection().catch((e) => {
    // eslint-disable-next-line no-console
    console.log('Error connecting to database');
    process.exit();
  });
});

test('Create User', async () => {
  const user = await UsersRepo.createDummyUser(googleID);
  expect(user.googleID).toBe(googleID);
  expect(user.netID).toBe('');
  ({ id } = user);
});

test('Create User with Fields', async () => {
  const netID = 'aa000@cornell.edu';
  const user = await UsersRepo.createUserWithFields(googleID2, 'First', 'Last', netID);
  expect(user.googleID).toBe(googleID2);
  expect(user.firstName).toBe('First');
  expect(user.lastName).toBe('Last');
  expect(user.email).toBe(netID);
  expect(user.netID).toBe('aa000');
  id2 = user.id;
});

test('Get User by ID', async () => {
  const user = await UsersRepo.getUserByID(id);
  expect(user.id).toEqual(id);
  expect(user.googleID).toBe(googleID);

  const user2 = await UsersRepo.getUserByID(id2);
  expect(user2.id).toEqual(id2);
  expect(user2.googleID).toBe(googleID2);
});

test('Get User by googleID', async () => {
  const user = await UsersRepo.getUserByGoogleID(googleID);
  expect(user.id).toEqual(id);
  expect(user.googleID).toBe(googleID);

  const user2 = await UsersRepo.getUserByGoogleID(googleID2);
  expect(user2.id).toEqual(id2);
  expect(user2.googleID).toBe(googleID2);
});

test('Get Users', async () => {
  const users = await UsersRepo.getUsers();
  const user = users.find(u => u.id === id);
  expect(user).toBeDefined();
});

test('Get Users from IDs', async () => {
  let users = await UsersRepo.getUsersFromIDs([id]);
  expect(users.length).toEqual(1);
  expect(users[0].id).toBe(id);

  users = await UsersRepo.getUsersFromIDs([id, id2]);
  expect(users.length).toEqual(2);

  users = await UsersRepo.getUsersFromIDs([id, id2], [id2]);
  expect(users.length).toEqual(1);
  expect(users[0].id).toBe(id);

  users = await UsersRepo.getUsersFromIDs([id, id2], [id, id2]);
  expect(users.length).toEqual(0);
});

test('Get Users by googleID', async () => {
  let users = await UsersRepo.getUsersByGoogleIDs([googleID]);
  expect(users.length).toEqual(1);
  expect(users[0].googleID).toBe(googleID);

  users = await UsersRepo.getUsersByGoogleIDs([googleID, googleID2]);
  expect(users.length).toEqual(2);

  users = await UsersRepo.getUsersByGoogleIDs([googleID, googleID2], [googleID2]);
  expect(users.length).toEqual(1);
  expect(users[0].googleID).toBe(googleID);

  users = await UsersRepo.getUsersByGoogleIDs([googleID, googleID2], [googleID, googleID2]);
  expect(users.length).toEqual(0);
});

test('Get Groups', async () => {
  const user = await UsersRepo.getUserByID(id);
  const code = await GroupsRepo.createCode();
  group = await GroupsRepo.createGroup('name', code);
  const adminGroups1 = await UsersRepo.getGroupsByID(id, 'admin');
  const memberGroups1 = await UsersRepo.getGroupsByID(id, 'member');
  expect(adminGroups1.length).toEqual(0);
  expect(memberGroups1.length).toEqual(0);

  await GroupsRepo.addUsersByIDs(group.id, id, 'member');
  group2 = await GroupsRepo.createGroup('group2', GroupsRepo.createCode(), user);
  const allGroups = await UsersRepo.getGroupsByID(id);
  const adminGroups2 = await UsersRepo.getGroupsByID(id, 'admin');
  const memberGroups2 = await UsersRepo.getGroupsByID(id, 'member');
  expect(allGroups.length).toEqual(2);
  expect(adminGroups2.length).toEqual(1);
  expect(adminGroups2[0].id).toBe(group2.id);
  expect(memberGroups2.length).toEqual(1);
  expect(memberGroups2[0].id).toBe(group.id);

  await GroupsRepo.deleteGroupByID(group.id);
  await GroupsRepo.deleteGroupByID(group2.id);
});

test('Delete User', async () => {
  await UsersRepo.deleteUserByID(id);
  await UsersRepo.deleteUserByID(id2);
  expect(await UsersRepo.getUserByID(id)).not.toBeDefined();
  expect(await UsersRepo.getUserByID(id2)).not.toBeDefined();
});

// Teardown
afterAll(async () => {
  // eslint-disable-next-line no-console
  console.log('Passed all user tests');
});
