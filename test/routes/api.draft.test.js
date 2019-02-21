import dbConnection from '../../src/db/DbConnection';
import UsersRepo from '../../src/repos/UsersRepo';
import UserSessionsRepo from '../../src/repos/UserSessionsRepo';

const request = require('request-promise-native');
const {
    get, post, del, put,
} = require('./lib');

let draft1;
let draft2;
let userID;
let userToken;

beforeAll(async () => {
    await dbConnection().catch((e) => {
        // eslint-disable-next-line no-console
        console.log('Error connecting to database');
        process.exit();
    });
    const user = await UsersRepo.createDummyUser('googleID');
    userID = user.id;
    const session = await UserSessionsRepo.createOrUpdateSession(user, null, null);
    userToken = session.sessionToken;
});

test('Create a draft', async () => {
    const body = {
        text: 'Test draft',
        options: ['yes', 'no'],
    };
    const getstr = await request(post('/drafts/', body, userToken));
    const getres = getstr;
    draft1 = getres.data.node;
    expect(getres.success).toBe(true);
    expect(draft1).toMatchObject(body);
});

test('Get drafts (Authorized)', async () => {
    const getstr = await request(get('/drafts/', userToken));
    const getres = getstr;
    const { edges } = getres.data;
    expect(getres.success).toBe(true);
    expect(edges.length).toBe(1);
    expect(edges[0].node).toMatchObject(draft1);
});

test('Get drafts (Unauthorized)', async () => {
    await request(get('/drafts/', 'blah'))
        .catch((e) => {
            expect(e.statusCode).toBe(401);
        });
});

test('Update a draft', async () => {
    const body = {
        text: 'Test draft updated',
    };
    const getstr = await request(put(`/drafts/${draft1.id}`, body, userToken));
    const getres = getstr;
    const { node } = getres.data;
    expect(getres.success).toBe(true);
    expect(node.text).toBe(body.text);
    expect(node.options).toMatchObject(draft1.options);
    expect(node.id).toBe(draft1.id);
    draft1 = node;
});

test('Create another draft', async () => {
    const body = {
        text: 'Another One ... DJ Khaled',
        options: ['yes'],
    };
    const getstr = await request(post('/drafts/', body, userToken));
    const getres = getstr;
    draft2 = getres.data.node;
    expect(getres.success).toBe(true);
    expect(draft2).toMatchObject(body);
});

test('Get updated list of drafts (Authorized)', async () => {
    const getstr = await request(get('/drafts/', userToken));
    const getres = getstr;
    const { edges } = getres.data;
    expect(getres.success).toBe(true);
    expect(edges.length).toBe(2);
    expect(edges[0].node).toMatchObject(draft1);
    expect(edges[1].node).toMatchObject(draft2);
});

test('Delete draft', async () => {
    let result = await request(del(`/drafts/${draft1.id}`, userToken));
    expect(result.success).toBe(true);
    result = await request(del(`/drafts/${draft2.id}`, userToken));
    expect(result.success).toBe(true);
});

afterAll(async () => {
    UsersRepo.deleteUserByID(userID);
});
