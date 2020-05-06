import DraftCollectionsRepo from '../../src/repos/DraftCollectionsRepo';
import UsersRepo from '../../src/repos/UsersRepo';
import dbConnection from '../../src/db/DbConnection';
import DraftsRepo from '../../src/repos/DraftsRepo';
import Draft from '../../src/models/Draft';
import GroupsRepo from '../../src/repos/GroupsRepo';
import Group from '../../src/models/Group';

let user1;
let user2;
let user3;
let user4;
let draft1;
let draft2;
let draft3;
let draft4;
let group1;
let group2;

let draftCollection1;
let draftCollection2;
let draftCollection3;

beforeAll(async () => {
  await dbConnection().catch((e) => {
    console.log('Error connecting to database');
    process.exit();
  });
});

beforeEach(async () => {
  user1 = await UsersRepo.createDummyUser('U1');
  user2 = await UsersRepo.createDummyUser('U2');
  user3 = await UsersRepo.createDummyUser('U3');
  user4 = await UsersRepo.createDummyUser('U4');
  draft1 = await DraftsRepo.createDraft('D1', ['A', ' B'], user1);
  draft2 = await DraftsRepo.createDraft('D2', [], user1);
  draft3 = await DraftsRepo.createDraft('D3', ['1', '2'], user2);
  draft4 = await DraftsRepo.createDraft('D4', ['this is user one'], user1);
  group1 = await GroupsRepo.createGroup('G1', await GroupsRepo.createCode(), user1);
  group2 = await GroupsRepo.createGroup('G2', await GroupsRepo.createCode(), user3);
  await GroupsRepo.addUsersByIDs(group1.uuid, [user2.uuid], 'member');
  await GroupsRepo.addUsersByIDs(group2.uuid, [user4.uuid], 'member');

  draftCollection1 = await DraftCollectionsRepo.createDraftCollection('C1', group1);
  draftCollection2 = await DraftCollectionsRepo.createDraftCollection('C2', group1);
  draftCollection3 = await DraftCollectionsRepo.createDraftCollection('C3', group2);
});

test('Create Draft Collection', async () => {
  expect(draftCollection1.name).toBe('C1');
  expect(draftCollection1.drafts.length).toBe(0);
  expect(draftCollection1.group.uuid).toBe(group1.uuid);
});

test('Get Draft Collection', async () => {
  const dc = await DraftCollectionsRepo.getDraftCollection(draftCollection1.uuid);
  expect(dc.name).toBe(draftCollection1.name);
  expect(dc.drafts.length).toBe(draftCollection1.drafts.length);
  expect(dc.group.uuid).toBe(draftCollection1.group.uuid);
});

test('Get Draft Collections By Group', async () => {
  const dc = await DraftCollectionsRepo.getDraftCollectionsByGroup(group1.uuid);
  expect(dc.length).toBe(2);
  expect(dc[0].group.uuid).toBe(group1.uuid);
});

test('Update Collection Name by ID', async () => {
  let dc = await DraftCollectionsRepo.updateCollectionNameByID(draftCollection1.uuid, 'updated');
  expect(dc.name).toBe('updated');

  dc = await DraftCollectionsRepo.updateCollectionNameByID(draftCollection1.uuid);
  expect(dc.name).toBe('updated');
});

test('Add Draft by ID', async () => {
  await DraftCollectionsRepo.addDraftByID(draftCollection1.uuid, draft1.uuid);
  let dc = await DraftCollectionsRepo.getDraftCollection(draftCollection1.uuid);
  expect(dc.drafts.length).toBe(1);
  expect(dc.drafts[0].name).toBe(draft1.name);
  expect(dc.drafts[0].position).toBe(0);

  await DraftCollectionsRepo.addDraftByID(draftCollection1.uuid, draft2.uuid);
  dc = await DraftCollectionsRepo.getDraftCollection(draftCollection1.uuid);
  expect(dc.drafts.length).toBe(2);
  expect(dc.drafts[1].text).toBe(draft2.text);
  dc.drafts.forEach((d, i) => expect(d.position).toBe(i));

  await DraftCollectionsRepo.addDraftByID(draftCollection1.uuid, draft1.uuid);
  dc = await DraftCollectionsRepo.getDraftCollection(draftCollection1.uuid);
  expect(dc.drafts.length).toBe(2);
  expect(dc.drafts[0].text).toBe(draft1.text);
  expect(dc.drafts[1].text).toBe(draft2.text);
  dc.drafts.forEach((d, i) => expect(d.position).toBe(i));

  await DraftCollectionsRepo.addDraftByID(draftCollection1.uuid, draft3.uuid);
  dc = await DraftCollectionsRepo.getDraftCollection(draftCollection1.uuid);
  expect(dc.drafts.length).toBe(3);
  expect(dc.drafts[0].name).toBe(draft1.name);
  expect(dc.drafts[1].name).toBe(draft2.name);
  expect(dc.drafts[2].name).toBe(draft3.name);
  dc.drafts.forEach((d, i) => expect(d.position).toBe(i));

  await DraftCollectionsRepo.addDraftByID(draftCollection1.uuid, draft4.uuid, 1);
  dc = await DraftCollectionsRepo.getDraftCollection(draftCollection1.uuid);
  expect(dc.drafts.length).toBe(4);
  expect(dc.drafts[0].text).toBe(draft1.text);
  expect(dc.drafts[1].text).toBe(draft4.text);
  expect(dc.drafts[2].text).toBe(draft2.text);
  expect(dc.drafts[3].name).toBe(draft3.name);
  dc.drafts.forEach((d, i) => expect(d.position).toBe(i));
});

test('Remove Draft By ID', async () => {
  // add Drafts 1, 2, 4 to the collection
  await DraftCollectionsRepo.addDraftByID(draftCollection1.uuid, draft1.uuid);
  await DraftCollectionsRepo.addDraftByID(draftCollection1.uuid, draft2.uuid);
  await DraftCollectionsRepo.addDraftByID(draftCollection1.uuid, draft4.uuid);

  // remove Draft 1 and test
  let dc = await DraftCollectionsRepo.getDraftCollection(draftCollection1.uuid);
  expect(dc.drafts[0].text).toBe(draft1.text);
  expect(dc.drafts[1].text).toBe(draft2.text);
  expect(dc.drafts[2].text).toBe(draft4.text);
  dc.drafts.forEach((d, i) => expect(d.position).toBe(i));

  // remove Draft 2 and test
  await DraftCollectionsRepo.removeDraftById(draftCollection1.uuid, draft2.uuid);
  dc = await DraftCollectionsRepo.getDraftCollection(draftCollection1.uuid);
  let draftCheck = await DraftsRepo.getDraft(draft2.uuid);
  expect(draftCheck.position).toBe(null);
  expect(dc.drafts[0].text).toBe(draft1.text);
  expect(dc.drafts[1].text).toBe(draft4.text);
  dc.drafts.forEach((d, i) => expect(d.position).toBe(i));

  // try to remove Draft 1 (not in collection) and test
  await DraftCollectionsRepo.removeDraftById(draftCollection1.uuid, draft1.uuid);
  dc = await DraftCollectionsRepo.getDraftCollection(draftCollection1.uuid);
  expect(dc.drafts[0].text).toBe(draft4.text);
  dc.drafts.forEach((d, i) => expect(d.position).toBe(i));

  // add Draft 1 back to collection (testing removal and adding back in a different position)
  await DraftCollectionsRepo.addDraftByID(draftCollection1.uuid, draft1.uuid);
  dc = await DraftCollectionsRepo.getDraftCollection(draftCollection1.uuid);
  expect(dc.drafts[0].uuid).toBe(draft4.uuid);
  expect(dc.drafts.length).toBe(2);
  dc.drafts.forEach((d, i) => expect(d.position).toBe(i));

  // delete Draft 4 and test if collection updates
  await DraftsRepo.deleteDraft(draft4.uuid);
  dc = await DraftCollectionsRepo.getDraftCollection(draftCollection1.uuid);
  expect(dc.drafts.length).toBe(1);
  expect(dc.drafts[0].uuid).toBe(draft1.uuid);
  expect(dc.drafts[0].position).toBe(0);

  // Remove Draft 1
  await DraftCollectionsRepo.removeDraftById(draftCollection1.uuid, draft1.uuid);
  dc = await DraftCollectionsRepo.getDraftCollection(draftCollection1.uuid);
  expect(dc.drafts.length).toBe(0);

  // remove from empty collection
  await DraftCollectionsRepo.removeDraftById(draftCollection1.uuid, draft1.uuid)
  dc = await DraftCollectionsRepo.getDraftCollection(draftCollection1.uuid);
  expect(dc.drafts.length).toBe(0);
});

test('Move Draft By ID', async () => {
  await DraftCollectionsRepo.addDraftByID(draftCollection1.uuid, draft1.uuid);
  await DraftCollectionsRepo.addDraftByID(draftCollection1.uuid, draft2.uuid);
  await DraftCollectionsRepo.addDraftByID(draftCollection1.uuid, draft4.uuid);

  // test basic movement functionality
  await DraftCollectionsRepo.moveDraftByID(draftCollection1.uuid, draft1.uuid, 2);
  let dc = await DraftCollectionsRepo.getDraftCollection(draftCollection1.uuid);
  expect(dc.drafts[0].text).toBe(draft2.text);
  expect(dc.drafts[1].text).toBe(draft4.text);
  expect(dc.drafts[2].text).toBe(draft1.text);
  dc.drafts.forEach((d, i) => expect(d.position).toBe(i));

  // test that a negative position simply pushes the draft to the end
  await DraftCollectionsRepo.moveDraftByID(draftCollection1.uuid, draft4.uuid, -5);
  dc = await DraftCollectionsRepo.getDraftCollection(draftCollection1.uuid);
  expect(dc.drafts[0].name).toBe(draft2.name);
  expect(dc.drafts[1].name).toBe(draft1.name);
  expect(dc.drafts[2].name).toBe(draft4.name);
  dc.drafts.forEach((d, i) => expect(d.position).toBe(i));

  // test that an out of bounds position simply pushes the draft to the end
  await DraftCollectionsRepo.moveDraftByID(draftCollection1.uuid, draft2.uuid, 55);
  dc = await DraftCollectionsRepo.getDraftCollection(draftCollection1.uuid);
  expect(dc.drafts[0].text).toBe(draft1.text);
  expect(dc.drafts[1].text).toBe(draft4.text);
  expect(dc.drafts[2].text).toBe(draft2.text);
  dc.drafts.forEach((d, i) => expect(d.position).toBe(i));
});

test('Delete Draft Collection by ID', async () => {
  await DraftCollectionsRepo.addDraftByID(draftCollection1.uuid, draft1.uuid);
  await DraftCollectionsRepo.addDraftByID(draftCollection1.uuid, draft2.uuid);
  await DraftCollectionsRepo.addDraftByID(draftCollection1.uuid, draft4.uuid);

  await DraftCollectionsRepo.deleteDraftCollectionByID(draftCollection1.uuid);
  let dc = await DraftCollectionsRepo.getDraftCollection(draftCollection1.uuid);
  expect(Boolean(dc)).toBe(false);
  let d = await DraftsRepo.getDraft(draft1.uuid);
  expect(d.draftCollection).toBe(undefined);

  dc = await DraftCollectionsRepo.getDraftCollection(draftCollection2.uuid);
  expect(Boolean(dc)).toBe(true);

  dc = await DraftCollectionsRepo.getDraftCollection(draftCollection3.uuid);
  expect(Boolean(dc)).toBe(true);
});

test('Delete Draft Collection by Group ID', async () => {
  await DraftCollectionsRepo.addDraftByID(draftCollection1.uuid, draft1.uuid);
  await DraftCollectionsRepo.addDraftByID(draftCollection1.uuid, draft2.uuid);
  await DraftCollectionsRepo.addDraftByID(draftCollection1.uuid, draft4.uuid);

  await DraftCollectionsRepo.deleteDraftCollectionByGroupID(group1.uuid);

  await DraftCollectionsRepo.deleteDraftCollectionByID(draftCollection1.uuid);
  let dc = await DraftCollectionsRepo.getDraftCollection(draftCollection1.uuid);
  expect(Boolean(dc)).toBe(false);

  dc = await DraftCollectionsRepo.getDraftCollection(draftCollection2.uuid);
  expect(Boolean(dc)).toBe(false);

  dc = await DraftCollectionsRepo.getDraftCollection(draftCollection3.uuid);
  expect(Boolean(dc)).toBe(true);
});

afterEach(async () => {
  await UsersRepo.deleteUserByID(user1.uuid);
  await UsersRepo.deleteUserByID(user2.uuid);
  await UsersRepo.deleteUserByID(user3.uuid);
  await UsersRepo.deleteUserByID(user4.uuid);
  await GroupsRepo.deleteGroupByID(group1.uuid);
  await GroupsRepo.deleteGroupByID(group2.uuid);
  // await DraftCollectionsRepo.deleteDraftCollectionByGroupID(draftCollection1.uuid);
  // await DraftCollectionsRepo.deleteDraftCollectionByGroupID(draftCollection2.uuid);
  // await DraftCollectionsRepo.deleteDraftCollectionByGroupID(draftCollection3.uuid);
});

afterAll(async () => {
  console.log('Passed all draft collection tests');
});
