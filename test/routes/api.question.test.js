import dbConnection from '../../src/db/DbConnection';
import UsersRepo from '../../src/repos/UsersRepo';
import UserSessionsRepo from '../../src/repos/UserSessionsRepo';
import GroupsRepo from '../../src/repos/GroupsRepo';

const request = require('request-promise-native');
const {
    get, post, del, put,
} = require('./lib');

let group;
let session;
let question;
let admin;
let member;
let adminToken;
let memberToken;

beforeAll(async () => {
    await dbConnection().catch((e) => {
        // eslint-disable-next-line no-console
        console.log('Error connecting to database');
        process.exit();
    });
    member = await UsersRepo.createDummyUser('member');
    admin = await UsersRepo.createDummyUser('admin');
    adminToken = (await UserSessionsRepo.createOrUpdateSession(admin, null, null)).sessionToken;
    memberToken = (await UserSessionsRepo.createOrUpdateSession(member, null, null)).sessionToken;

    const opts = { name: 'Test group', code: GroupsRepo.createCode() };
    const result = await request(post('/sessions/', opts, adminToken));
    group = result.data.node;
    expect(result.success).toBe(true);

    await GroupsRepo.addUsersByGoogleIDs(group.id, ['member'], 'member');
});

test('create question', async () => {
    const opts = {
        text: 'Why do we have to test s***? (PG-13)',
    };
    const result = await request(post(`/sessions/${group.id}/questions`, opts, memberToken));
    question = result.data.node;
    expect(result.success).toBe(true);
});

test('create question with invalid token', async () => {
    const opts = {
        text: 'Why do we have to test s***? (PG-13)',
    };
    const result = await request(post(`/sessions/${group.id}/questions`, opts, adminToken));
    expect(result.success).toBe(false);
});

test('get question by id', async () => {
    const getstr = await request(get(`/questions/${question.id}`, memberToken));
    const getres = getstr;
    expect(getres.success).toBe(true);
    expect(question.id).toBe(getres.data.node.id);
});

test('get questions by group', async () => {
    const getstr = await request(get(`/sessions/${group.id}/questions`, adminToken));
    const getres = getstr;
    expect(getres.success).toBe(true);
    expect(question.id).toBe(getres.data.edges[0].node.id);
});

test('update question', async () => {
    const opts = {
        text: 'Why do we have to test stuff? (PG)',
    };
    const getstr = await request(put(`/questions/${question.id}`, opts, memberToken));
    const getres = getstr;
    expect(getres.success).toBe(true);
    expect(getres.data.node.text).toBe('Why do we have to test stuff? (PG)');
    expect(getres.data.node.id).toBe(question.id);
});

test('update question with invalid token', async () => {
    const opts = {
        text: 'Why do we have to test stuff? (PG)',
    };
    const getstr = await request(put(`/questions/${question.id}`, opts, adminToken));
    const getres = getstr;
    expect(getres.success).toBe(false);
});

test('delete question', async () => {
    const result = await request(del(`/questions/${question.id}`, memberToken));
    expect(result.success).toBe(true);
});

afterAll(async () => {
    const result = await request(del(`/sessions/${group.id}`, adminToken));
    expect(result.success).toBe(true);
    await UsersRepo.deleteUserByID(admin.id);
    await UsersRepo.deleteUserByID(member.id);
    await UserSessionsRepo.deleteSession(session.id);
    // eslint-disable-next-line no-console
    console.log('Passed all question route tests');
});
