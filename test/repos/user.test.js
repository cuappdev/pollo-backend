import SessionsRepo from '../../src/repos/SessionsRepo';
import UsersRepo from '../../src/repos/UsersRepo';
import dbConnection from '../../src/db/DbConnection';
import AppDevUtils from '../../src/utils/AppDevUtils';

let id;
let id2;
const googleId = AppDevUtils.randomCode(6);
const googleId2 = AppDevUtils.randomCode(6);
let session;
let session2;

// Connects to db before running tests and does setup
beforeAll(async () => {
    await dbConnection().catch((e) => {
        console.log('Error connecting to database');
        process.exit();
    });
});

test('Create User', async () => {
    const user = await UsersRepo.createDummyUser(googleId);
    expect(user.googleId).toBe(googleId);
    expect(user.netId).toBe('');
    ({ id } = user);
});

test('Create User with Fields', async () => {
    const user = await UsersRepo.createUserWithFields(googleId2, 'First', 'Last', 'aa000@cornell.edu');
    expect(user.googleId).toBe(googleId2);
    expect(user.firstName).toBe('First');
    expect(user.lastName).toBe('Last');
    expect(user.email).toBe('aa000@cornell.edu');
    expect(user.netId).toBe('aa000');
    id2 = user.id;
});

test('Get User by Id', async () => {
    const user = await UsersRepo.getUserById(id);
    expect(user.id).toEqual(id);
    expect(user.googleId).toBe(googleId);

    const user2 = await UsersRepo.getUserById(id2);
    expect(user2.id).toEqual(id2);
    expect(user2.googleId).toBe(googleId2);
});

test('Get User by googleId', async () => {
    const user = await UsersRepo.getUserByGoogleId(googleId);
    expect(user.id).toEqual(id);
    expect(user.googleId).toBe(googleId);

    const user2 = await UsersRepo.getUserByGoogleId(googleId2);
    expect(user2.id).toEqual(id2);
    expect(user2.googleId).toBe(googleId2);
});

test('Get Users', async () => {
    const users = await UsersRepo.getUsers();
    const user = users.find(u => u.id === id);
    expect(user).toBeDefined();
});

test('Get Users from Ids', async () => {
    let users = await UsersRepo.getUsersFromIds([id]);
    expect(users.length).toEqual(1);
    expect(users[0].id).toBe(id);

    users = await UsersRepo.getUsersFromIds([id, id2]);
    expect(users.length).toEqual(2);

    users = await UsersRepo.getUsersFromIds([id, id2], [id2]);
    expect(users.length).toEqual(1);
    expect(users[0].id).toBe(id);

    users = await UsersRepo.getUsersFromIds([id, id2], [id, id2]);
    expect(users.length).toEqual(0);
});

test('Get Users by googleId', async () => {
    let users = await UsersRepo.getUsersByGoogleIds([googleId]);
    expect(users.length).toEqual(1);
    expect(users[0].googleId).toBe(googleId);

    users = await UsersRepo.getUsersByGoogleIds([googleId, googleId2]);
    expect(users.length).toEqual(2);

    users = await UsersRepo.getUsersByGoogleIds([googleId, googleId2], [googleId2]);
    expect(users.length).toEqual(1);
    expect(users[0].googleId).toBe(googleId);

    users = await UsersRepo.getUsersByGoogleIds([googleId, googleId2], [googleId, googleId2]);
    expect(users.length).toEqual(0);
});

test('Get Sessions', async () => {
    const user = await UsersRepo.getUserById(id);
    const code = await SessionsRepo.createCode();
    session = await SessionsRepo.createSession('name', code);
    const adminSessions1 = await UsersRepo.getSessionsById(id, 'admin');
    const memberSessions1 = await UsersRepo.getSessionsById(id, 'member');
    expect(adminSessions1.length).toEqual(0);
    expect(memberSessions1.length).toEqual(0);

    await SessionsRepo.addUsersByIds(session.id, id, 'member');
    session2 = await SessionsRepo.createSession('session2', SessionsRepo.createCode(), user);
    const allSessions = await UsersRepo.getSessionsById(id);
    const adminSessions2 = await UsersRepo.getSessionsById(id, 'admin');
    const memberSessions2 = await UsersRepo.getSessionsById(id, 'member');
    expect(allSessions.length).toEqual(2);
    expect(adminSessions2.length).toEqual(1);
    expect(adminSessions2[0].id).toBe(session2.id);
    expect(memberSessions2.length).toEqual(1);
    expect(memberSessions2[0].id).toBe(session.id);

    await SessionsRepo.deleteSessionById(session.id);
    await SessionsRepo.deleteSessionById(session2.id);
});

test('Delete User', async () => {
    await UsersRepo.deleteUserById(id);
    await UsersRepo.deleteUserById(id2);
    expect(await UsersRepo.getUserById(id)).not.toBeDefined();
    expect(await UsersRepo.getUserById(id2)).not.toBeDefined();
});

// Teardown
afterAll(async () => {
    console.log('Passed all user tests');
});
