import dbConnection from '../../src/db/DbConnection';
import UsersRepo from '../../src/repos/UsersRepo';
import UserSessionsRepo from '../../src/repos/UserSessionsRepo';
import GroupsRepo from '../../src/repos/GroupsRepo';

const request = require('request-promise-native');
const {
    get, post, del, put,
} = require('./lib');

// Polls
// Must be running server to test

const googleID = 'usertest';
let group;
let session;
let poll;
let userID;
let token;

beforeAll(async () => {
    await dbConnection().catch((e) => {
        // eslint-disable-next-line no-console
        console.log('Error connecting to database');
        process.exit();
    });
    const user = await UsersRepo.createDummyUser(googleID);
    userID = user.id;
    session = await UserSessionsRepo.createOrUpdateSession(user, null, null);
    token = session.sessionToken;

    // Create a group
    const opts = { name: 'Test group', code: GroupsRepo.createCode() };
    const result = await request(post('/sessions/', opts, token));
    group = result.data.node;
    expect(result.success).toBe(true);
});

test('create poll', async () => {
    const opts = {
        text: 'Poll text', shared: true, type: 'MULTIPLE_CHOICE', correctAnswer: 'B',
    };
    const result = await request(post(`/sessions/${group.id}/polls`, opts, token));
    poll = result.data.node;
    expect(result.success).toBe(true);
});

test('create poll with invalid token', async () => {
    const opts = {
        text: 'Poll text', results: {}, shared: true, correctAnswer: '',
    };
    await request(post(`/sessions/${group.id}/polls`, opts, 'invalid'))
        .catch((e) => {
            expect(e.statusCode).toBe(401);
        });
});

test('get poll by id', async () => {
    const getstr = await request(get(`/polls/${poll.id}`, token));
    const getres = getstr;
    expect(getres.success).toBe(true);
    expect(poll.id).toBe(getres.data.node.id);
});

test('get polls by group', async () => {
    const getstr = await request(get(`/sessions/${group.id}/polls`, token));
    const getres = getstr;
    expect(getres.success).toBe(true);
    expect(poll.id).toBe(getres.data[0].polls[0].id);
});

test('update poll', async () => {
    const opts = {
        text: 'Updated text',
        results: { A: 1 },
        shared: false,
    };
    const getstr = await request(put(`/polls/${poll.id}`, opts, token));
    const getres = getstr;
    expect(getres.success).toBe(true);
    expect(getres.data.node.text).toBe('Updated text');
    expect(getres.data.node.results).toMatchObject({ A: 1 });
});

test('update poll with invalid token', async () => {
    const opts = {
        text: 'Updated text',
        results: { A: 1 },
    };
    await request(put(`/polls/${poll.id}`, opts, 'invalid'))
        .catch((e) => {
            expect(e.statusCode).toBe(401);
        });
});

test('delete poll with invalid token', async () => {
    await request(del(`/polls/${poll.id}`, 'invalid'))
        .catch((e) => {
            expect(e.statusCode).toBe(401);
        });
});

test('delete poll', async () => {
    const result = await request(del(`/polls/${poll.id}`, token));
    expect(result.success).toBe(true);
});

afterAll(async () => {
    const result = await request(del(`/sessions/${group.id}`, token));
    expect(result.success).toBe(true);
    await UsersRepo.deleteUserByID(userID);
    await UserSessionsRepo.deleteSession(session.id);
    // eslint-disable-next-line no-console
    console.log('Passed all poll route tests');
});
