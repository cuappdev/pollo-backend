import DraftsRepo from '../../src/repos/DraftsRepo';
import UsersRepo from '../../src/repos/UsersRepo';
import dbConnection from '../../src/db/DbConnection';

let draft1;
let draft2;
let draft3;
let user1;
let user2;

// Connects to db before running tests and does setup
beforeAll(async () => {
  await dbConnection().catch((e) => {
    // eslint-disable-next-line no-console
    console.log('Error connecting to database');
    process.exit();
  });
  user1 = await UsersRepo.createDummyUser('1234');
  user2 = await UsersRepo.createDummyUser('ABCD');
});

test('Create Draft', async () => {
  draft1 = await DraftsRepo.createDraft('What\'s up?', ['A', 'B', 'C', 'D'], user1);
  expect(draft1.text).toBe('What\'s up?');
  expect(draft1.options).toEqual(['A', 'B', 'C', 'D']);
  expect(draft1.user).toEqual(user1);

  draft2 = await DraftsRepo.createDraft('Are you awake?', [], user1);
  expect(draft2.text).toBe('Are you awake?');
  expect(draft2.options).toEqual([]);
  expect(draft2.user).toEqual(user1);

  draft3 = await DraftsRepo.createDraft('', ['AB'], user1);
  expect(draft3.text).toBe('');
  expect(draft3.options).toEqual(['AB']);
  expect(draft3.user).toEqual(user1);
});

test('Get Draft', async () => {
  const temp = await DraftsRepo.getDraft(draft1.uuid);
  expect(temp.text).toBe(draft1.text);
  expect(temp.options).toEqual(draft1.options);
  expect(temp.user.uuid).toEqual(draft1.user.uuid);

  const temp2 = await DraftsRepo.getDraft(draft2.uuid);
  expect(temp2.text).toBe(draft2.text);
  expect(temp2.options).toEqual(draft2.options);
  expect(temp2.user.uuid).toEqual(draft2.user.uuid);

  const temp3 = await DraftsRepo.getDraft(draft3.uuid);
  expect(temp3.text).toBe(draft3.text);
  expect(temp3.options).toEqual(draft3.options);
  expect(temp3.user.uuid).toEqual(draft3.user.uuid);
});

test('Get Drafts from User', async () => {
  const drafts = await DraftsRepo.getDraftsByUser(user1.uuid);
  expect(drafts.length).toBe(3);
  expect(drafts[0].uuid).toBe(draft1.uuid);
  expect(drafts[1].uuid).toBe(draft2.uuid);
  expect(drafts[2].uuid).toBe(draft3.uuid);

  const drafts2 = await DraftsRepo.getDraftsByUser(user2.uuid);
  expect(drafts2.length).toBe(0);
});

test('Update Draft', async () => {
  const newDraft = await DraftsRepo.updateDraft(draft1.uuid, 'New Question', []);
  expect(newDraft.text).toBe('New Question');
  expect(newDraft.options).toEqual([]);
  expect(newDraft.uuid).toBe(draft1.uuid);
  draft1 = newDraft;

  const newDraft2 = await DraftsRepo.updateDraft(draft2.uuid, '', ['hi', 'hello']);
  expect(newDraft2.text).toBe('');
  expect(newDraft2.options).toEqual(['hi', 'hello']);
  expect(newDraft2.uuid).toBe(draft2.uuid);
  draft2 = newDraft2;
});

test('Get Owner of Draft', async () => {
  const user = await DraftsRepo.getOwnerByID(draft1.uuid);
  expect(user.uuid).toBe(user1.uuid);
});

test('Delete Draft', async () => {
  await DraftsRepo.deleteDraft(draft1.uuid);
  await DraftsRepo.deleteDraft(draft2.uuid);
  await DraftsRepo.deleteDraft(draft3.uuid);
  expect(await DraftsRepo.getDraft(draft1.uuid)).toBeFalsy();
  expect(await DraftsRepo.getDraft(draft2.uuid)).toBeFalsy();
  expect(await DraftsRepo.getDraft(draft3.uuid)).toBeFalsy();
});

// Teardown
afterAll(async () => {
  await UsersRepo.deleteUserByID(user1.uuid);
  await UsersRepo.deleteUserByID(user2.uuid);
  // eslint-disable-next-line no-console
  console.log('Passed all draft tests');
});
