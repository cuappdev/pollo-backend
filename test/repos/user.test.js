import GroupsRepo from '../../src/repos/GroupsRepo';
import UsersRepo from '../../src/repos/UsersRepo';
import dbConnection from '../../src/db/DbConnection';
import AppDevUtils from '../../src/utils/AppDevUtils';

let uuid;
let uuid2;
const email = AppDevUtils.randomCode(6);
const email2 = AppDevUtils.randomCode(6);
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
  const user = await UsersRepo.createDummyUser(email);
  expect(user.email).toBe(email);
  expect(user.netID).toBe('');
  ({ uuid } = user);
});

test('Create User with Fields', async () => {
  const user = await UsersRepo.createUserWithFields('First', 'Last', email2);
  expect(user.email).toBe(email2);
  expect(user.firstName).toBe('First');
  expect(user.lastName).toBe('Last');
  uuid2 = user.uuid;
});

test('Get User by ID', async () => {
  const user = await UsersRepo.getUserByID(uuid);
  expect(user.uuid).toEqual(uuid);
  expect(user.email).toBe(email);

  const user2 = await UsersRepo.getUserByID(uuid2);
  expect(user2.uuid).toEqual(uuid2);
  expect(user2.email).toBe(email2);
});

test('Get User by email', async () => {
  const user = await UsersRepo.getUserByEmail(email);
  expect(user.uuid).toEqual(uuid);
  expect(user.email).toBe(email);

  const user2 = await UsersRepo.getUserByEmail(email2);
  expect(user2.uuid).toEqual(uuid2);
  expect(user2.email).toBe(email2);
});

test('Get Users', async () => {
  const users = await UsersRepo.getUsers();
  const user = users.find(u => u.uuid === uuid);
  expect(user).toBeDefined();
});

test('Get Users from IDs', async () => {
  let users = await UsersRepo.getUsersFromIDs([uuid]);
  expect(users.length).toEqual(1);
  expect(users[0].uuid).toBe(uuid);

  users = await UsersRepo.getUsersFromIDs([uuid, uuid2]);
  expect(users.length).toEqual(2);

  users = await UsersRepo.getUsersFromIDs([uuid, uuid2], [uuid2]);
  expect(users.length).toEqual(1);
  expect(users[0].uuid).toBe(uuid);

  users = await UsersRepo.getUsersFromIDs([uuid, uuid2], [uuid, uuid2]);
  expect(users.length).toEqual(0);
});

test('Get Groups', async () => {
  const user = await UsersRepo.getUserByID(uuid);
  const code = await GroupsRepo.createCode();
  group = await GroupsRepo.createGroup('name', code);
  const adminGroups1 = await UsersRepo.getGroupsByID(uuid, 'admin');
  const memberGroups1 = await UsersRepo.getGroupsByID(uuid, 'member');
  expect(adminGroups1.length).toEqual(0);
  expect(memberGroups1.length).toEqual(0);

  await GroupsRepo.addUsersByIDs(group.uuid, [uuid], 'member');
  group2 = await GroupsRepo.createGroup('group2', GroupsRepo.createCode(), user);
  const allGroups = await UsersRepo.getGroupsByID(uuid);
  const adminGroups2 = await UsersRepo.getGroupsByID(uuid, 'admin');
  const memberGroups2 = await UsersRepo.getGroupsByID(uuid, 'member');
  expect(allGroups.length).toEqual(2);
  expect(adminGroups2.length).toEqual(1);
  expect(adminGroups2[0].uuid).toBe(group2.uuid);
  expect(memberGroups2.length).toEqual(1);
  expect(memberGroups2[0].uuid).toBe(group.uuid);

  await GroupsRepo.deleteGroupByID(group.uuid);
  await GroupsRepo.deleteGroupByID(group2.uuid);
});

test('Delete User', async () => {
  await UsersRepo.deleteUserByID(uuid);
  await UsersRepo.deleteUserByID(uuid2);
  expect(await UsersRepo.getUserByID(uuid)).not.toBeDefined();
  expect(await UsersRepo.getUserByID(uuid2)).not.toBeDefined();
});

// Teardown
afterAll(async () => {
  // eslint-disable-next-line no-console
  console.log('Passed all user tests');
});
