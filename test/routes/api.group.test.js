import request from 'request-promise-native';
import dbConnection from '../../src/db/DbConnection';
import UsersRepo from '../../src/repos/UsersRepo';
import UserSessionsRepo from '../../src/repos/UserSessionsRepo';
import GroupsRepo from '../../src/repos/GroupsRepo';
import PollsRepo from '../../src/repos/PollsRepo';

const {
  get, post, del, put,
} = require('./lib');

// Groups
// Must be running server to test

const opts = { name: 'Test group', code: GroupsRepo.createCode(), location: { lat: 1, long: -0.5 } };
const opts2 = { name: 'New group' };
const opts3 = { isRestricted: true };
const googleID = 'usertest';
let adminToken;
let userToken;
let session;
let group;
let adminID;
let userID;

beforeAll(async () => {
  await dbConnection().catch((e) => {
    // eslint-disable-next-line no-console
    console.log('Error connecting to database');
    process.exit();
  });

  const user = await UsersRepo.createDummyUser(googleID);
  adminID = user.id;
  session = await UserSessionsRepo.createOrUpdateSession(user, null, null);
  adminToken = session.sessionToken;
});

test('Create group', async () => {
  await request(post('/sessions/', opts, adminToken)).then((result) => {
    expect(result.success).toBe(true);
    group = result.data;
  });
});

test('Get single group', async () => {
  await request(get(`/sessions/${group.id}`, adminToken)).then((getres) => {
    expect(getres.success).toBe(true);
    expect(group).toMatchObject(getres.data);
  });
});

test('Get groups for admin', async () => {
  await request(get('/sessions/all/admin/', adminToken)).then((getres) => {
    expect(getres.success).toBe(true);
    const groupRes = getres.data[0];
    expect(group.id).toBe(groupRes.id);
    expect(group.name).toBe(groupRes.name);
    expect(group.code).toBe(groupRes.code);
    expect(group.updatedAt).toBe(groupRes.updatedAt);
  });
});

test('Add admins to group', async () => {
  const user = await UsersRepo.createDummyUser('dummy');
  userID = user.id;
  const body = {
    adminIDs: [userID],
  };
  await request(post(`/sessions/${group.id}/admins/`, body,
    adminToken)).then((getres) => {
    expect(getres.success).toBe(true);
  });
});

test('Get admins for group', async () => {
  await request(get(`/sessions/${group.id}/admins/`, adminToken)).then((getres) => {
    expect(getres.success).toBe(true);
    const admins = getres.data;
    expect(admins.length).toBe(2);
    expect(admins[0].id).toBe(adminID);
    expect(admins[1].id).toBe(userID);
  });
});

test('Remove admin from group', async () => {
  const body = {
    adminIDs: [userID],
  };
  await request(put(`/sessions/${group.id}/admins/`, body,
    adminToken)).then((getres) => {
    expect(getres.success).toBe(true);
    UsersRepo.deleteUserByID(userID);
  });
});

test('Add members to group', async () => {
  const user = await UsersRepo.createDummyUser('dummy');
  userID = user.id;
  userToken = (await UserSessionsRepo.createOrUpdateSession(user, null, null)).sessionToken;
  const body = {
    memberIDs: [userID],
  };
  await request(post(`/sessions/${group.id}/members/`, body,
    adminToken)).then((getres) => {
    expect(getres.success).toBe(true);
  });
});

test('Get groups as member', async () => {
  await request(get('/sessions/all/member/', userToken)).then((getres) => {
    expect(getres.success).toBe(true);
    const groupRes = getres.data[0];
    expect(group.id).toBe(groupRes.id);
    expect(group.name).toBe(groupRes.name);
    expect(group.code).toBe(groupRes.code);
    expect(group.updatedAt).toBe(groupRes.updatedAt);
  });
});

test('Get members of group', async () => {
  await request(get(`/sessions/${group.id}/members/`, adminToken)).then((getres) => {
    expect(getres.success).toBe(true);
    const members = getres.data;
    expect(members.length).toBe(1);
    expect(members[0].id).toBe(userID);
  });
});

test('Get group location restriction', async () => {
  const isRestricted = await GroupsRepo.isLocationRestricted(group.id);
  expect(isRestricted).toBe(false);
});

test('Update group location restriction', async () => {
  await request(put(`/sessions/${group.id}/`, opts3, adminToken)).then((getres) => {
    expect(getres.success).toBe(true);
    expect(getres.data.isLocationRestricted).toBe(true);
  });
});

test('Update group location as admin with non-null location', async () => {
  const updatedGroup = await GroupsRepo.updateGroupByID(group.id, null, opts.location);
  expect(updatedGroup.location).toEqual(opts.location);
});

test('Update group location as admin with null location', async () => {
  const updatedGroup = await GroupsRepo.updateGroupByID(group.id, null, { lat: null, long: null });
  expect(updatedGroup.location).toEqual(group.location);
});

test('Update profanity filter group control', async () => {
  const updatedGroup = await GroupsRepo.updateGroupByID(group.id, null, null, false);
  expect(updatedGroup.isFilterActivated).toEqual(group.isFilterActivated);
});

test('Leave group', async () => {
  await request(del(`/sessions/${group.id}/members/`, userToken),
    (error, res, body) => {
      expect(body.success).toBe(true);
    });

  await request(get(`/sessions/${group.id}/members/`, adminToken),
    (error, res, body) => {
      expect(body.success).toBe(true);
      expect(body.data.length).toBe(0);
    });

  const postBody = {
    memberIDs: [userID],
  };
  await request(post(`/sessions/${group.id}/members/`, postBody, adminToken),
    (error, res, body) => {
      expect(body.success).toBe(true);
    });
});

test('Remove member from group', async () => {
  const body = {
    memberIDs: [userID],
  };
  await request(put(`/sessions/${group.id}/members`, body,
    adminToken)).then((getres) => {
    expect(getres.success).toBe(true);
  });
  await UsersRepo.deleteUserByID(userID);
});

test('Get groups for admin', async () => {
  await request(get('/sessions/all/admin/', adminToken)).then((getres) => {
    expect(getres.success).toBe(true);
    const groupRes = getres.data[0];
    expect(group.id).toBe(groupRes.id);
    expect(group.name).toBe(groupRes.name);
    expect(group.code).toBe(groupRes.code);
  });
});

test('Update group', async () => {
  await request(put(`/sessions/${group.id}`, opts2, adminToken)).then((getres) => {
    expect(getres.success).toBe(true);
    expect(getres.data.name).toBe('New group');
  });
});

test('Update group with invalid adminToken', async () => {
  await request(put(`/sessions/${group.id}`, opts2, 'invalid'))
    .catch((e) => {
      expect(e.statusCode).toBe(401);
    });
});

test('Download csv', async () => {
  const p1 = await PollsRepo.createPoll('Poll text', group, [{ letter: 'A', text: 'Saturn' },
    { letter: 'B', text: 'Mars' }], 'multiplechoice', 'A', { u1: [{ letter: 'A', text: 'Saturn' }], u2: [{ letter: 'B', text: 'Mars' }] }, 'ended');
  const p2 = await PollsRepo.createPoll('Poll text', group, [{ letter: 'A', text: 'Earth' },
    { letter: 'B', text: 'Venus' }], 'multiplechoice', 'B', { u1: [{ letter: 'B', text: 'Venus' }], u2: [{ letter: 'A', text: 'Earth' }] }, 'ended');

  const result = await request(get(`/sessions/${group.id}/csv`, adminToken));
  console.log(result);

  await PollsRepo.deletePollByID(p1.id);
  await PollsRepo.deletePollByID(p2.id);
});

test('Delete group with invalid adminToken', async () => {
  await request(del(`/sessions/${group.id}`, 'invalid'))
    .catch((e) => {
      expect(e.statusCode).toBe(401);
    });
});

test('Delete group', async () => {
  const result = await request(del(`/sessions/${group.id}`, adminToken));
  expect(result.success).toBe(true);
});

afterAll(async () => {
  await UsersRepo.deleteUserByID(adminID);
  await UserSessionsRepo.deleteSession(session.id);
  // eslint-disable-next-line no-console
  console.log('Passed all group route tests');
});
