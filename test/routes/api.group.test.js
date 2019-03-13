import request from 'request-promise-native';
import dbConnection from '../../src/db/DbConnection';
import UsersRepo from '../../src/repos/UsersRepo';
import UserSessionsRepo from '../../src/repos/UserSessionsRepo';
import GroupsRepo from '../../src/repos/GroupsRepo';

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
  adminID = user.id;
  session = await UserSessionsRepo.createOrUpdateSession(user, null, null);
  adminToken = session.sessionToken;
});

test('create group', async () => {
  await request(post('/sessions/', opts, adminToken)).then((result) => {
    expect(result.success).toBe(true);
    group = result.data;
  });
});

test('get single group', async () => {
  await request(get(`/sessions/${group.id}`, adminToken)).then((getres) => {
    expect(getres.success).toBe(true);
    expect(group).toMatchObject(getres.data);
  });
});

test('get groups for admin', async () => {
  await request(get('/sessions/all/admin', adminToken)).then((getres) => {
    expect(getres.success).toBe(true);
    const groupRes = getres.data[0];
    expect(group.id).toBe(groupRes.id);
    expect(group.name).toBe(groupRes.name);
    expect(group.code).toBe(groupRes.code);
    expect(group.updatedAt).toBe(groupRes.updatedAt);
  });
});

test('add admins to group', async () => {
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

test('get admins for group', async () => {
  await request(get(`/sessions/${group.id}/admins/`, adminToken)).then((getres) => {
    expect(getres.success).toBe(true);
    const admins = getres.data;
    expect(admins.length).toBe(2);
    expect(admins[0].id).toBe(adminID);
    expect(admins[1].id).toBe(userID);
  });
});

test('remove admin from group', async () => {
  const body = {
    adminIDs: [userID],
  };
  await request(put(`/sessions/${group.id}/admins/`, body,
    adminToken)).then((getres) => {
    expect(getres.success).toBe(true);
    UsersRepo.deleteUserByID(userID);
  });
});

test('add members to group', async () => {
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

test('get groups as member', async () => {
  await request(get('/sessions/all/member/', userToken)).then((getres) => {
    expect(getres.success).toBe(true);
    const groupRes = getres.data[0];
    expect(group.id).toBe(groupRes.id);
    expect(group.name).toBe(groupRes.name);
    expect(group.code).toBe(groupRes.code);
    expect(group.updatedAt).toBe(groupRes.updatedAt);
  });
});

test('get members of group', async () => {
  await request(get(`/sessions/${group.id}/members/`, adminToken)).then((getres) => {
    expect(getres.success).toBe(true);
    const members = getres.data;
    expect(members.length).toBe(1);
    expect(members[0].id).toBe(userID);
  });
});

test('leave group', async () => {
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

test('remove member from group', async () => {
  const body = {
    memberIDs: [userID],
  };
  await request(put(`/sessions/${group.id}/members`, body,
    adminToken)).then((getres) => {
    expect(getres.success).toBe(true);
  });
  await UsersRepo.deleteUserByID(userID);
});

test('get groups for admin', async () => {
  await request(get('/sessions/all/admin/', adminToken)).then((getres) => {
    expect(getres.success).toBe(true);
    const groupRes = getres.data[0];
    expect(group.id).toBe(groupRes.id);
    expect(group.name).toBe(groupRes.name);
    expect(group.code).toBe(groupRes.code);
    expect(group.updatedAt).toBe(groupRes.updatedAt);
  });
});

test('update group', async () => {
  await request(put(`/sessions/${group.id}`, opts2, adminToken)).then((getres) => {
    expect(getres.success).toBe(true);
    expect(getres.data.name).toBe('New group');
  });
});

test('update group with invalid adminToken', async () => {
  await request(put(`/sessions/${group.id}`, opts2, 'invalid'))
    .catch((e) => {
      expect(e.statusCode).toBe(401);
    });
});

test('delete group with invalid adminToken', async () => {
  await request(del(`/sessions/${group.id}`, 'invalid'))
    .catch((e) => {
      expect(e.statusCode).toBe(401);
    });
});

test('delete group', async () => {
  const result = await request(del(`/sessions/${group.id}`, adminToken));
  expect(result.success).toBe(true);
});

afterAll(async () => {
  await UsersRepo.deleteUserByID(adminID);
  await UserSessionsRepo.deleteSession(session.id);
  // eslint-disable-next-line no-console
  console.log('Passed all group route tests');
});
