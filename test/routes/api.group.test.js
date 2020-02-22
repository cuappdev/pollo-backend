import request from 'request-promise-native';
import axios from 'axios';
import dbConnection from '../../src/db/DbConnection';
import UsersRepo from '../../src/repos/UsersRepo';
import UserSessionsRepo from '../../src/repos/UserSessionsRepo';
import GroupsRepo from '../../src/repos/GroupsRepo';
import PollsRepo from '../../src/repos/PollsRepo';
import Poll from '../../src/models/Poll';

const {
  get, post, del, put,
} = require('./lib');

// Groups
// Must be running server to test

const opts = { name: 'Test group', code: GroupsRepo.createCode() };
const opts2 = { name: 'New group' };
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
  adminID = user.uuid;
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
  await request(get(`/sessions/${group.id}/`, adminToken)).then((getres) => {
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
  userID = user.uuid;
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
  userID = user.uuid;
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
  const g = await GroupsRepo.getGroupByID(group.id);
  let polls: Array<?Poll> = await GroupsRepo.getPolls(group.id);
  console.log(`found ${polls.length} polls`);
  const p1 = await PollsRepo.createPoll(
    'Poll 1', g, [{ letter: 'A', text: 'Saturn' }, { letter: 'B', text: 'Mars' }],
    'multiplechoice', 'A',
    { u1: [{ letter: 'A', text: 'Saturn' }], u2: [{ letter: 'B', text: 'Mars' }] }, 'ended',
  );
  polls = await GroupsRepo.getPolls(group.id);
  console.log(`found ${polls.length} polls`);
  const p2 = await PollsRepo.createPoll(
    'Poll 2', g, [{ letter: 'A', text: 'Earth' }, { letter: 'B', text: 'Venus' }],
    'multiplechoice', 'B',
    { u1: [{ letter: 'B', text: 'Venus' }], u2: [{ letter: 'A', text: 'Earth' }] }, 'ended',
  );

  const u1 = await UsersRepo.createUserWithFields('u1', 'u', '1', 'u1@example.com');
  const u2 = await UsersRepo.createUserWithFields('u2', 'u', '2', 'u2@example.com');

  await GroupsRepo.addUsersByIDs(group.id, [u1.uuid, u2.uuid]);

  polls = await GroupsRepo.getPolls(group.id);
  console.log(`found ${polls.length} polls`);

  let result = await axios.get(`http://localhost:3000/api/v2/sessions/${group.id}/csv`, {
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
    data: {
      format: 'cmsx',
      dates: [new Date()],
    },
  }).catch((e) => {
    console.log(e);
    expect(e).toBe(null);
  });

  expect(result.status).toBe(200);
  expect(result.data).toBe('NetID,Assignment Points,Assignment Total,Adjustments,Comments\nu1,2,2,,\nu2,2,2,,\n');

  const u3 = await UsersRepo.createUserWithFields('u3', 'u', '3', 'u3@example.com');
  await GroupsRepo.addUsersByIDs(group.id, [u3.uuid]);

  result = await axios.get(`http://localhost:3000/api/v2/sessions/${group.id}/csv`, {
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
    data: {
      format: 'cmsx',
      dates: [new Date()],
    },
  }).catch((e) => {
    console.log(e);
    expect(e).toBe(null);
  });

  expect(result.status).toBe(200);
  expect(result.data)
    .toBe('NetID,Assignment Points,Assignment Total,Adjustments,Comments\nu1,A,B,,\nu2,B,A,,\nu3,0,2,,\n');

  const p3 = await PollsRepo.createPoll(
    'Poll 3', g, [{ letter: 'A', text: 'Earth' }, { letter: 'B', text: 'Venus' }],
    'multiplechoice', 'B',
    { u3: [{ letter: 'A', text: 'Earth' }] }, 'ended',
  );

  result = await axios.get(`http://localhost:3000/api/v2/sessions/${group.id}/csv`, {
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
    data: {
      format: 'cmsx',
      dates: [new Date()],
    },
  }).catch((e) => {
    console.log(e);
    expect(e).toBe(null);
  });

  expect(result.status).toBe(200);
  expect(result.data)
    .toBe('NetID,Assignment Points,Assignment Total,Adjustments,Comments\nu1,2,3,,\nu2,2,3,,\nu3,1,3,,\n');

  await PollsRepo.deletePollByID(p1.uuid);
  await PollsRepo.deletePollByID(p2.uuid);
  await PollsRepo.deletePollByID(p3.uuid);

  await GroupsRepo.removeUserByGroupID(group.id, u1.uuid);
  await GroupsRepo.removeUserByGroupID(group.id, u2.uuid);
  await GroupsRepo.removeUserByGroupID(group.id, u3.uuid);

  await UsersRepo.deleteUserByID(u1.uuid);
  await UsersRepo.deleteUserByID(u2.uuid);
  await UsersRepo.deleteUserByID(u3.uuid);
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
  await UserSessionsRepo.deleteSession(session.uuid);
  // eslint-disable-next-line no-console
  console.log('Passed all group route tests');
});
