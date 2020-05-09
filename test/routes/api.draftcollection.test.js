import request from 'request-promise-native';
import dbConnection from '../../src/db/DbConnection';
import GroupsRepo from '../../src/repos/GroupsRepo';
import UsersRepo from '../../src/repos/UsersRepo';
import Group from '../../src/models/Group';
import UserSessionsRepo from '../../src/repos/UserSessionsRepo';
import DraftsRepo from '../../src/repos/DraftsRepo';
import Draft from '../../src/models/Draft';
import DraftCollectionsRepo from '../../src/repos/DraftCollectionsRepo';

const {
  get, post, del, put,
} = require('./lib');

let admin1ID;
let admin1Token;
let user1ID;
let user1Token;
let admin2ID;
let admin2Token;
let user2ID;
let user2Token;
let group1;
let group2;

let draft1ID;
let draft2ID;
let draft3ID;
let draft4ID;

// Connects to db before running tests and does setup
beforeAll(async () => {
  await dbConnection().catch((e) => {
    console.log('Error connecting to database');
    process.exit();
  });
});

beforeEach(async () => {
  const admin1 = await UsersRepo.createDummyUser('A1');
  const user1 = await UsersRepo.createDummyUser('U1');
  const admin2 = await UsersRepo.createDummyUser('A2');
  const user2 = await UsersRepo.createDummyUser('U2');

  admin1ID = admin1.uuid;
  user1ID = user1.uuid;
  admin2ID = admin2.uuid;
  user2ID = user2.uuid;

  admin1Token = (await UserSessionsRepo.createOrUpdateSession(admin1, null, null)).sessionToken;
  admin2Token = (await UserSessionsRepo.createOrUpdateSession(admin2, null, null)).sessionToken;
  user1Token = (await UserSessionsRepo.createOrUpdateSession(user1, null, null)).sessionToken;
  user2Token = (await UserSessionsRepo.createOrUpdateSession(user2, null, null)).sessionToken;

  group1 = await GroupsRepo.createGroup('Group', await GroupsRepo.createCode(), admin1);
  group2 = await GroupsRepo.createGroup('NewGroup', await GroupsRepo.createCode(), admin2);

  draft1ID = (await DraftsRepo.createDraft('D1', [], admin1)).uuid;
  draft2ID = (await DraftsRepo.createDraft('D2', [], user1)).uuid;
  draft3ID = (await DraftsRepo.createDraft('D3', [], admin2)).uuid;
  draft4ID = (await DraftsRepo.createDraft('D4', [], user2)).uuid;

  await GroupsRepo.addUsersByIDs(group1.uuid, [user1.uuid], 'member');
  await GroupsRepo.addUsersByIDs(group2.uuid, [user2.uuid], 'member');
});

test('Create Draft Collections', async () => {
  // Test group admin can create a collection
  await request(post(`/sessions/${group1.uuid}/collections/`, { name: 'C1' }, admin1Token))
    .then((getRes) => {
      let dc1 = getRes.data;
      expect(getRes.success).toBe(true);
      expect(dc1).toMatchObject({ name: 'C1' });
    });

  // Test group member cannot create a collection
  await request(post(`/sessions/${group1.uuid}/collections/`, { name: 'Not Admin' }, user1Token))
    .then((getRes) => {
      expect(getRes.success).toBe(false);
    });

  // Test group admin can create a collection (double check)
  await request(post(`/sessions/${group2.uuid}/collections/`, { name: 'C2' }, admin2Token))
    .then((getRes) => {
      let dc2 = getRes.data;
      expect(getRes.success).toBe(true);
      expect(dc2).toMatchObject({ name: 'C2' });
    });

  // Test admins cannot create collections for groups for which they are not admins
  await request(post(`/sessions/${group2.uuid}/collections/`, { name: 'Other Admin' }, admin1Token))
    .then((getRes) => {
      expect(getRes.success).toBe(false);
    });
});

test('Get Draft Collection', async () => {
  let cID;
  await request(post(`/sessions/${group1.uuid}/collections/`, { name: 'C1' }, admin1Token))
    .then((getRes) => {
      cID = getRes.data.id;
    });

  // Test admin can get collection
  await request(get(`/collections/${cID}/`, admin1Token))
    .then((getRes) => {
      expect(getRes.success).toBe(true);
      expect(getRes.data.name).toBe('C1');
    });

  // Test member canot get collection
  await request(get(`/collections/${cID}/`, user1Token))
    .then((getRes) => {
      expect(getRes.success).toBe(false);
    });
});

test('Add Draft to Collection', async () => {
  let cID;
  await request(post(`/sessions/${group1.uuid}/collections/`, { name: 'C1' }, admin1Token))
    .then((getRes) => {
      cID = getRes.data.id;
    });

  // Test admin can add draft without specifying position
  await request(post(`/collections/${cID}/`, { draftID: draft1ID }, admin1Token))
    .then((getRes) => {
      expect(getRes.success).toBe(true);
    });
  let dc = await DraftCollectionsRepo.getDraftCollection(cID);
  expect(dc.drafts.length).toBe(1);
  expect(dc.drafts[0].uuid).toBe(draft1ID);

  // Test user cannot add draft to collection
  await request(post(`/collections/${cID}/`, { draftID: draft2ID }, user1Token))
    .then((getRes) => {
      expect(getRes.success).toBe(false);
    });
  dc = await DraftCollectionsRepo.getDraftCollection(cID);
  expect(dc.drafts.length).toBe(1);

  // Test admin can add draft with specific position
  await request(post(`/collections/${cID}/`, { draftID: draft2ID, pos: 0 }, admin1Token))
    .then((getRes) => {
      expect(getRes.success).toBe(true);
    });
  dc = await DraftCollectionsRepo.getDraftCollection(cID);
  expect(dc.drafts.length).toBe(2);
  expect(dc.drafts[0].uuid).toBe(draft2ID);

  // Test adding draft with bad negative position defaults to appending
  await request(post(`/collections/${cID}/`, { draftID: draft3ID, pos: -100 }, admin1Token))
    .then((getRes) => {
      expect(getRes.success).toBe(true);
    });
  dc = await DraftCollectionsRepo.getDraftCollection(cID);
  expect(dc.drafts.length).toBe(3);
  expect(dc.drafts[2].uuid).toBe(draft3ID);

  // Test adding draft with bad positive position defaults to appending
  await request(post(`/collections/${cID}/`, { draftID: draft4ID, pos: 100 }, admin1Token))
    .then((getRes) => {
      expect(getRes.success).toBe(true);
    });
  dc = await DraftCollectionsRepo.getDraftCollection(cID);
  expect(dc.drafts.length).toBe(4);
  expect(dc.drafts[3].uuid).toBe(draft4ID);

  // Test adding draft already in collection does nothing
  await request(post(`/collections/${cID}/`, { draftID: draft1ID, pos: 4 }, admin1Token))
    .then((getRes) => {
      expect(getRes.success).toBe(true);
    });
  dc = await DraftCollectionsRepo.getDraftCollection(cID);
  expect(dc.drafts.length).toBe(4);
  expect(dc.drafts[1].uuid).toBe(draft1ID);
});

test('Update Draft Collection', async () => {
  let cID;
  let dc;
  await request(post(`/sessions/${group1.uuid}/collections/`, { name: 'C1' }, admin1Token))
    .then((getRes) => {
      cID = getRes.data.id;
    });
  await request(post(`/collections/${cID}/`, { draftID: draft1ID }, admin1Token));
  await request(post(`/collections/${cID}/`, { draftID: draft2ID }, admin1Token));
  await request(post(`/collections/${cID}/`, { draftID: draft3ID }, admin1Token));
  await request(post(`/collections/${cID}/`, { draftID: draft4ID }, admin1Token));

  // Test just updating name works
  await request(put(`/collections/${cID}/`, { name: 'UPDATED' }, admin1Token))
    .then(getRes => expect(getRes.success).toBe(true));
  dc = await DraftCollectionsRepo.getDraftCollection(cID);
  expect(dc.name).toBe('UPDATED');

  // Test non-admin cannot update name
  await request(put(`/collections/${cID}/`, { name: 'bad name' }, user1Token))
    .then(getRes => expect(getRes.success).toBe(false));
  dc = await DraftCollectionsRepo.getDraftCollection(cID);
  expect(dc.name).toBe('UPDATED');

  // Test updating draft position works
  await request(put(`/collections/${cID}/`, { draftID: draft1ID, pos: 2 }, admin1Token))
    .then(getRes => expect(getRes.success).toBe(true));
  dc = await DraftCollectionsRepo.getDraftCollection(cID);
  expect(dc.drafts[2].uuid).toBe(draft1ID);

  // Test non-admin cannot update draft positions
  await request(put(`/collections/${cID}/`, { draftID: draft4ID, pos: 0 }, user1Token))
    .then(getRes => expect(getRes.success).toBe(false));
  dc = await DraftCollectionsRepo.getDraftCollection(cID);
  expect(dc.drafts[0].uuid).toBe(draft2ID);

  // Test updating position to 0 (edge case)
  await request(put(`/collections/${cID}/`, { draftID: draft4ID, pos: 0 }, admin1Token))
    .then(getRes => expect(getRes.success).toBe(true));
  dc = await DraftCollectionsRepo.getDraftCollection(cID);
  expect(dc.drafts[0].uuid).toBe(draft4ID);

  // Test that position cannot be left out
  await request(put(`/collections/${cID}/`, { draftID: draft1ID }, admin1Token))
    .then(getRes => expect(getRes.success).toBe(false));
});

test('Get Drafts From Collection', async () => {
  let cID;
  await request(post(`/sessions/${group1.uuid}/collections/`, { name: 'C1' }, admin1Token))
    .then((getRes) => {
      cID = getRes.data.id;
    });
  await request(post(`/collections/${cID}/`, { draftID: draft1ID }, admin1Token));
  await request(post(`/collections/${cID}/`, { draftID: draft2ID }, admin1Token));
  await request(post(`/collections/${cID}/`, { draftID: draft3ID }, admin1Token));
  await request(post(`/collections/${cID}/`, { draftID: draft4ID }, admin1Token));

  // Test admin can get all drafts
  await request(get(`/collections/${cID}/drafts/`, admin1Token))
    .then((getRes) => {
      expect(getRes.success).toBe(true);
      expect(getRes.data[0].id).toBe(draft1ID);
      expect(getRes.data[1].id).toBe(draft2ID);
      expect(getRes.data[2].id).toBe(draft3ID);
      expect(getRes.data[3].id).toBe(draft4ID);
    });

  // Test user cannot get all drafts
  await request(get(`/collections/${cID}/drafts/`, user1Token))
    .then((getRes) => {
      expect(getRes.success).toBe(false);
    });

  // Test admin gets all drafts in the correct order
  await request(put(`/collections/${cID}/`, { draftID: draft4ID, pos: 0 }, admin1Token));
  await request(put(`/collections/${cID}/`, { draftID: draft3ID, pos: 1 }, admin1Token));
  await request(get(`/collections/${cID}/drafts/`, admin1Token))
    .then((getRes) => {
      expect(getRes.success).toBe(true);
      expect(getRes.data[0].id).toBe(draft4ID);
      expect(getRes.data[1].id).toBe(draft3ID);
      expect(getRes.data[2].id).toBe(draft1ID);
      expect(getRes.data[3].id).toBe(draft2ID);
    });
});

test('Get All Collections in a Group', async () => {
  let c11;
  let c12;
  let c21;
  await request(post(`/sessions/${group1.uuid}/collections/`, { name: 'C1_1' }, admin1Token))
    .then((getRes) => {
      c11 = getRes.data;
    });
  await request(post(`/sessions/${group1.uuid}/collections/`, { name: 'C1_2' }, admin1Token))
    .then((getRes) => {
      c12 = getRes.data;
    });
  await request(post(`/sessions/${group2.uuid}/collections/`, { name: 'C2_1' }, admin2Token))
    .then((getRes) => {
      c21 = getRes.data;
    });

  // Test admins can get collections
  await request(get(`/sessions/${group1.uuid}/collections/`, admin1Token)).then((getRes) => {
    expect(getRes.success).toBe(true);
    expect(getRes.data.length).toBe(2);
    expect(getRes.data).toContainEqual(c11);
    expect(getRes.data).toContainEqual(c12);
  });
  await request(get(`/sessions/${group2.uuid}/collections/`, admin2Token)).then((getRes) => {
    expect(getRes.success).toBe(true);
    expect(getRes.data.length).toBe(1);
    expect(getRes.data).toContainEqual(c21);
  });

  // Test non-admins cannot get collections
  await request(get(`/sessions/${group2.uuid}/collections/`, user1Token)).then((getRes) => {
    expect(getRes.success).toBe(false);
  });
});

test('Delete Draft from Collection', async () => {
  let cID;
  let dc;
  await request(post(`/sessions/${group1.uuid}/collections/`, { name: 'C1' }, admin1Token))
    .then((getRes) => {
      cID = getRes.data.id;
    });
  await request(post(`/collections/${cID}/`, { draftID: draft1ID }, admin1Token));
  await request(post(`/collections/${cID}/`, { draftID: draft2ID }, admin1Token));
  await request(post(`/collections/${cID}/`, { draftID: draft3ID }, admin1Token));
  await request(post(`/collections/${cID}/`, { draftID: draft4ID }, admin1Token));

  // Test admin can remove from collection
  await request(put(`/collections/${cID}/drafts/`, { draftID: draft3ID }, admin1Token))
    .then((getRes) => {
      expect(getRes.success).toBe(true);
    });
  dc = await DraftCollectionsRepo.getDraftCollection(cID);
  expect(dc.drafts.length).toBe(3);
  expect(dc.drafts[2].uuid).toBe(draft4ID);

  // Test member cannot remove from collection
  await request(put(`/collections/${cID}/drafts/`, { draftID: draft2ID }, user1Token))
    .then((getRes) => {
      expect(getRes.success).toBe(false);
    });
  dc = await DraftCollectionsRepo.getDraftCollection(cID);
  expect(dc.drafts.length).toBe(3);
  expect(dc.drafts[2].uuid).toBe(draft4ID);

  // Test removing draft not in collection does nothing
  await request(put(`/collections/${cID}/drafts/`, { draftID: draft3ID }, admin1Token))
    .then((getRes) => {
      expect(getRes.success).toBe(true);
    });
  dc = await DraftCollectionsRepo.getDraftCollection(cID);
  expect(dc.drafts.length).toBe(3);
  expect(dc.drafts[2].uuid).toBe(draft4ID);

  // Test removing another draft from collection
  await request(put(`/collections/${cID}/drafts/`, { draftID: draft1ID }, admin1Token))
    .then((getRes) => {
      expect(getRes.success).toBe(true);
    });
  dc = await DraftCollectionsRepo.getDraftCollection(cID);
  expect(dc.drafts.length).toBe(2);
  expect(dc.drafts[0].uuid).toBe(draft2ID);
});

test('Delete DraftCollection', async () => {
  let cID1;
  let cID2;
  let dc;
  await request(post(`/sessions/${group1.uuid}/collections/`, { name: 'C1' }, admin1Token))
    .then((getRes) => {
      cID1 = getRes.data.id;
    });
  await request(post(`/sessions/${group1.uuid}/collections/`, { name: 'C2' }, admin1Token))
    .then((getRes) => {
      cID2 = getRes.data.id;
    });

  // Test admin can delete a collection
  await request(del(`/collections/${cID1}/`, admin1Token))
    .then(getRes => expect(getRes.success).toBe(true));
  dc = await DraftCollectionsRepo.getDraftCollection(cID1);
  expect(Boolean(dc)).toBe(false);

  // Test non-admin cannot delete a collection
  await request(del(`/collections/${cID2}/`, user1Token))
    .then(getRes => expect(getRes.success).toBe(false));
  dc = await DraftCollectionsRepo.getDraftCollection(cID2);
  expect(Boolean(dc)).toBe(true);

  // Test deleting another collection
  await request(del(`/collections/${cID2}/`, admin1Token))
    .then(getRes => expect(getRes.success).toBe(true));
  dc = await DraftCollectionsRepo.getDraftCollection(cID2);
  expect(Boolean(dc)).toBe(false);

  // Test deleting nonexistant collection
  await request(del(`/collections/${cID1}/`, admin1Token))
    .then(getRes => expect(getRes.success).toBe(false));
});

afterEach(async () => {
  await GroupsRepo.deleteGroupByID(group1.uuid);
  await GroupsRepo.deleteGroupByID(group2.uuid);
  await UsersRepo.deleteUserByID(admin1ID);
  await UsersRepo.deleteUserByID(user1ID);
  await UsersRepo.deleteUserByID(admin2ID);
  await UsersRepo.deleteUserByID(user2ID);
});

afterAll(async () => {
  console.log('Passed all draft collection route tests');
});
