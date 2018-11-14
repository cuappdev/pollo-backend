import dbConnection from '../../src/db/DbConnection';
import UsersRepo from '../../src/repos/UsersRepo';
import UserSessionsRepo from '../../src/repos/UserSessionsRepo';
import GroupsRepo from '../../src/repos/GroupsRepo';

const request = require('request-promise-native');
const {
    get, post, del, put,
} = require('./lib');

// Groups
// Must be running server to test

const opts = { name: 'Test group', code: GroupsRepo.createCode() };
const opts2 = { name: 'New group' };
const googleId = 'usertest';
let adminToken;
let userToken;
let session;
let group;
let adminId;
let userId;

beforeAll(async () => {
    await dbConnection().catch((e) => {
        console.log('Error connecting to database');
        process.exit();
    });

    const user = await UsersRepo.createDummyUser(googleId);
    adminId = user.id;
    session = await UserSessionsRepo.createOrUpdateSession(user, null, null);
    adminToken = session.sessionToken;
});

test('create group', async () => {
    const option = post('/groups/', opts, adminToken);
    const result = await request(option);
    group = result;
    expect(group.success).toBe(true);
});

test('get single group', async () => {
    const getstr = await request(get(`/groups/${group.data.node.id}`, adminToken));
    const getres = getstr;
    expect(getres.success).toBe(true);
    expect(group).toMatchObject(getres);
});

test('get groups for admin', async () => {
    const getstr = await request(get('/groups/all/admin', adminToken));
    const getres = getstr;
    expect(getres.success).toBe(true);
    const node = getres.data[0];
    expect(group.data.id).toBe(node.id);
    expect(group.data.name).toBe(node.name);
    expect(group.data.code).toBe(node.code);
});

test('add admins to group', async () => {
    const user = await UsersRepo.createDummyUser('dummy');
    userId = user.id;
    const body = {
        adminIds: [userId],
    };
    const getstr = await request(post(`/groups/${group.data.node.id}/admins/`, body,
        adminToken));
    const getres = getstr;
    expect(getres.success).toBe(true);
});

test('get admins for group', async () => {
    const getstr = await request(get(`/groups/${group.data.node.id}/admins/`, adminToken));
    const getres = getstr;
    expect(getres.success).toBe(true);
    const { edges } = getres.data;
    expect(edges.length).toBe(2);
    expect(edges[0].node.id).toBe(adminId);
    expect(edges[1].node.id).toBe(userId);
});

test('remove admin from group', async () => {
    const body = {
        adminIds: [userId],
    };
    const getstr = await request(put(`/groups/${group.data.node.id}/admins/`, body,
        adminToken));
    const getres = getstr;
    expect(getres.success).toBe(true);
    UsersRepo.deleteUserById(userId);
});

test('add members to group', async () => {
    const user = await UsersRepo.createDummyUser('dummy');
    userId = user.id;
    userToken = (await UserSessionsRepo.createOrUpdateSession(user, null, null)).sessionToken;
    const body = {
        memberIds: [userId],
    };
    const getstr = await request(post(`/groups/${group.data.node.id}/members/`, body,
        adminToken));
    const getres = getstr;
    expect(getres.success).toBe(true);
});

test('get groups as member', async () => {
    const getstr = await request(get('/groups/all/member/', userToken));
    const getres = getstr;
    expect(getres.success).toBe(true);
    const node = getres.data[0];
    expect(group.data.id).toBe(node.id);
    expect(group.data.name).toBe(node.name);
    expect(group.data.code).toBe(node.code);
});

test('get members of group', async () => {
    const getstr = await request(get(`/groups/${group.data.node.id}/members/`, adminToken));
    const getres = getstr;
    expect(getres.success).toBe(true);
    const { edges } = getres.data;
    expect(edges.length).toBe(1);
    expect(edges[0].node.id).toBe(userId);
});

test('leave group', async () => {
    await request(del(`/groups/${group.data.node.id}/members/`, userToken),
        (error, res, body) => {
            expect(body.success).toBe(true);
        });

    await request(get(`/groups/${group.data.node.id}/members/`, adminToken),
        (error, res, body) => {
            expect(body.success).toBe(true);
            expect(body.data.edges.length).toBe(0);
        });

    const postBody = {
        memberIds: [userId],
    };
    await request(post(`/groups/${group.data.node.id}/members/`, postBody, adminToken),
        (error, res, body) => {
            expect(body.success).toBe(true);
        });
});

test('remove member from group', async () => {
    const body = {
        memberIds: [userId],
    };
    const getstr = await request(put(`/groups/${group.data.node.id}/members`, body,
        adminToken));
    const getres = getstr;
    expect(getres.success).toBe(true);
    await UsersRepo.deleteUserById(userId);
});

test('get groups for admin', async () => {
    const getstr = await request(get('/groups/all/admin/', adminToken));
    const getres = getstr;
    expect(getres.success).toBe(true);
    const node = getres.data[0];
    expect(group.data.id).toBe(node.id);
    expect(group.data.name).toBe(node.name);
    expect(group.data.code).toBe(node.code);
});

test('update group', async () => {
    const getstr = await request(put(`/groups/${group.data.node.id}`, opts2, adminToken));
    const getres = getstr;
    expect(getres.success).toBe(true);
    expect(getres.data.node.name).toBe('New group');
});

test('update group with invalid adminToken', async () => {
    const getstr = await request(put(`/groups/${group.data.node.id}`, opts2, 'invalid'));
    const getres = getstr;
    expect(getres.success).toBe(false);
});

test('delete group with invalid adminToken', async () => {
    const result = await request(del(`/groups/${group.data.node.id}`, 'invalid'));
    expect(result.success).toBe(false);
});

test('delete group', async () => {
    const result = await request(del(`/groups/${group.data.node.id}`, adminToken));
    expect(result.success).toBe(true);
});

afterAll(async () => {
    await UsersRepo.deleteUserById(adminId);
    await UserSessionsRepo.deleteSession(session.id);
    console.log('Passed all group route tests');
});
