import DraftsRepo from '../../src/repos/DraftsRepo';
import UsersRepo from '../../src/repos/UsersRepo';
import dbConnection from '../../src/db/DbConnection';

var user1;
var user2;
var draft1;
var draft2;

// Connects to db before running tests and does setup
beforeAll(async () => {
  await dbConnection().catch(function (e) {
    console.log('Error connecting to database');
    process.exit();
  });
  user1 = await UsersRepo.createDummyUser('1234');
  user2 = await UsersRepo.createDummyUser('ABCD');
});

test('Create Draft', async () => {
  draft1 = await DraftsRepo.createDraft('What\'s up?', ['A', 'B', 'C', 'D'], user1);
  draft2 = await DraftsRepo.createDraft('Are you awake?', [], user1);
  expect(draft1.text).toBe('What\'s up?');
  expect(draft1.options).toEqual(['A', 'B', 'C', 'D']);
  expect(draft1.user).toEqual(user1);
  expect(draft2.text).toBe('Are you awake?');
  expect(draft2.options).toEqual([]);
  expect(draft2.user).toEqual(user1);
});

test('Get Draft', async () => {
  var temp = await DraftsRepo.getDraft(draft1.id);
  expect(temp.text).toBe(draft1.text);
  expect(temp.options).toEqual(draft1.options);
  expect(temp.user.id).toEqual(draft1.user.id);
});

test('Get Drafts from User', async () => {
  var drafts = await DraftsRepo.getDraftsByUser(user1.id);
  expect(drafts.length).toBe(2);
  expect(drafts[0].id).toBe(draft1.id);
  expect(drafts[1].id).toBe(draft2.id);

  drafts = await DraftsRepo.getDraftsByUser(user2.id);
  expect(drafts.length).toBe(0);
});

test('Update Draft', async () => {
  var newDraft = await DraftsRepo.updateDraft(draft1.id, 'New Question', undefined);
  expect(newDraft.text).toBe('New Question');
  expect(newDraft.options).toEqual(draft1.options);
  expect(newDraft.id).toBe(draft1.id);
  draft1 = newDraft;
});

test('Delete Draft', async () => {
  await DraftsRepo.deleteDraft(draft1.id);
  await DraftsRepo.deleteDraft(draft2.id);
  expect(await DraftsRepo.getDraft(draft1.id)).toBeFalsy();
  expect(await DraftsRepo.getDraft(draft2.id)).toBeFalsy();
});

// Teardown
afterAll(async () => {
  await UsersRepo.deleteUserById(user1.id);
  await UsersRepo.deleteUserById(user2.id);
  console.log('Passed all draft tests');
});
