import SessionsRepo from '../../src/repos/SessionsRepo';
import UsersRepo from '../../src/repos/UsersRepo';
import PollsRepo from '../../src/repos/PollsRepo';
import QuestionsRepo from '../../src/repos/QuestionsRepo';
import dbConnection from '../../src/db/DbConnection';

let code;
let code2;
let id;
let id2;
let user;
let user2;
let user3;
let user4;

// Connects to db before running tests and does setup
beforeAll(async () => {
    await dbConnection().catch((e) => {
        console.log('Error connecting to database');
        process.exit();
    });
});

test('Create Session', async () => {
    code = SessionsRepo.createCode();
    code2 = SessionsRepo.createCode();
    user = await UsersRepo.createDummyUser('sessiontest1');

    const session = await SessionsRepo.createSession('Session', code, user);
    expect(session.name).toBe('Session');
    expect(session.code).toBe(code);
    expect(session.admins.length).toEqual(1);
    expect(session.admins[0].googleId).toBe(user.googleId);
    expect(session.members.length).toEqual(0);
    ({ id } = session);

    const session2 = await SessionsRepo.createSession('NewSession', code2);
    expect(session2.admins.length).toEqual(0);
    expect(session.members.length).toEqual(0);
    id2 = session2.id;
});

test('Get Session by Id', async () => {
    const session = await SessionsRepo.getSessionById(id);
    expect(session.name).toBe('Session');
    expect(session.code).toBe(code);

    const session2 = await SessionsRepo.getSessionById(id2);
    expect(session2.name).toBe('NewSession');
    expect(session2.code).toBe(code2);
});

test('Get Session by Code', async () => {
    const tempid = await SessionsRepo.getSessionId(code);
    expect(tempid).toBe(id);
});

test('Update Session', async () => {
    const session = await SessionsRepo.updateSessionById(id, 'Update Session');
    expect(session.id).toBe(id);
    expect(session.name).toBe('Update Session');
});

test('Get Admins from Session', async () => {
    const admins = await SessionsRepo.getUsersBySessionId(id, 'admin');
    expect(admins.length).toEqual(1);
    expect(admins[0].googleId).toBe(user.googleId);

    const admins2 = await SessionsRepo.getUsersBySessionId(id2, 'admin');
    expect(admins2.length).toEqual(0);
});

test('Add Admin to Session by Id', async () => {
    user2 = await UsersRepo.createDummyUser('sessiontest2');
    user3 = await UsersRepo.createDummyUser('sessiontest3');
    user4 = await UsersRepo.createDummyUser('sessiontest4');

    const { admins } = await SessionsRepo.addUsersByIds(id, [user2.id], 'admin');
    expect(admins.length).toEqual(2);
    expect(admins[1].googleId).toBe(user2.googleId);

    const session = await SessionsRepo.addUsersByIds(id2, [user3.id, user4.id], 'admin');
    expect(session.admins.length).toEqual(2);
    expect(session.admins[0].googleId).toBe(user3.googleId);
    expect(session.admins[1].googleId).toBe(user4.googleId);
});

test('Remove Admin from Session', async () => {
    const session = await SessionsRepo.removeUserBySessionId(id, user2, 'admin');
    expect(session.admins.length).toEqual(1);
    expect(session.admins[0].googleId).toBe(user.googleId);
    ({ id } = session);

    expect(await SessionsRepo.isAdmin(id, user2)).toBe(false);
    expect(await SessionsRepo.isMember(id, user2)).toBe(false);
    expect(await SessionsRepo.isAdmin(id, user)).toBe(true);
    expect(await SessionsRepo.isMember(id, user)).toBe(false);

    await SessionsRepo.removeUserBySessionId(id2, user3, 'admin');
    const session2 = await SessionsRepo.removeUserBySessionId(id2, user4, 'admin');
    expect(session2.admins.length).toEqual(0);
});

test('Add Admin to Session by GoogleId', async () => {
    const { admins } = (await SessionsRepo.addUsersByGoogleIds(id, [user2.googleId], 'admin'));
    expect(admins.length).toEqual(2);
    expect(admins[1].id).toBe(user2.id);

    const session = await SessionsRepo.removeUserBySessionId(id, user2, 'admin');
    expect(session.admins.length).toEqual(1);
    ({ id } = session);

    let session2 = await SessionsRepo.addUsersByGoogleIds(id2, [user3.googleId, user4.googleId], 'admin');
    expect(session2.admins.length).toEqual(2);
    expect(session2.admins[0].id).toBe(user3.id);
    expect(session2.admins[1].id).toBe(user4.id);

    await SessionsRepo.removeUserBySessionId(id2, user3, 'admin');
    session2 = await SessionsRepo.removeUserBySessionId(id2, user4, 'admin');
    expect(session2.admins.length).toEqual(0);
});

test('Add Member to Session by GoogleId', async () => {
    const { members } = (await SessionsRepo.addUsersByGoogleIds(id, [user2.googleId], 'member'));
    expect(members.length).toEqual(1);
    expect(members[0].id).toBe(user2.id);

    const session = await SessionsRepo.addUsersByGoogleIds(id2, [user3.googleId, user4.googleId]);
    expect(session.members.length).toEqual(2);
    expect(session.members[0].id).toBe(user3.id);
    expect(session.members[1].id).toBe(user4.id);
});

test('Get Members of Session', async () => {
    const members = await SessionsRepo.getUsersBySessionId(id, 'member');
    expect(members.length).toEqual(1);
    expect(members[0].googleId).toBe(user2.googleId);

    const members2 = await SessionsRepo.getUsersBySessionId(id2, 'member');
    expect(members2.length).toEqual(2);
    expect(members2[0].id).toBe(user3.id);
    expect(members2[1].id).toBe(user4.id);
});

test('Get All Users of Session', async () => {
    const users = await SessionsRepo.getUsersBySessionId(id);
    expect(users.length).toEqual(2);
    expect(users[0].id).toBe(user.id);
    expect(users[1].id).toBe(user2.id);

    const users2 = await SessionsRepo.getUsersBySessionId(id2);
    expect(users2.length).toEqual(2);
});

test('Remove Member from Session', async () => {
    const session = await SessionsRepo.removeUserBySessionId(id, user2, 'member');
    expect(session.members.length).toEqual(0);
    ({ id } = session);

    await SessionsRepo.removeUserBySessionId(id2, user3, 'member');
    const session2 = await SessionsRepo.removeUserBySessionId(id2, user4);
    expect(session2.members.length).toEqual(0);
});

test('Add Members to Session by Id', async () => {
    let { members } = (await SessionsRepo.addUsersByIds(id, [user2.id], 'member'));
    expect(members.length).toEqual(1);
    expect(members[0].googleId).toBe(user2.googleId);

    ({ members } = await SessionsRepo.addUsersByIds(id, [user3.id, user4.id]));
    expect(members.length).toEqual(3);

    let session = await SessionsRepo.removeUserBySessionId(id, user3, 'member');
    session = await SessionsRepo.removeUserBySessionId(id, user4, 'member');
    ({ id } = session);
});

test('Get Polls from Session', async () => {
    const session = await SessionsRepo.getSessionById(id);
    let polls = await SessionsRepo.getPolls(id);
    expect(polls.length).toEqual(0);

    const poll = await PollsRepo.createPoll('Poll', session, {}, true, 'MULTIPLE_CHOICE');
    const poll2 = await PollsRepo.createPoll('', session, {}, false, 'FREE_RESPONSE', {});
    polls = await SessionsRepo.getPolls(id, true);
    expect(polls.length).toEqual(1);
    expect(polls[0].id).toBe(poll.id);
    polls = await SessionsRepo.getPolls(id, false);
    expect(polls.length).toEqual(2);
    expect(polls[0].id).toBe(poll.id);
    expect(polls[1].id).toBe(poll2.id);

    await PollsRepo.deletePollById(poll.id);
    await PollsRepo.deletePollById(poll2.id);
});

test('Get Questions from Session', async () => {
    const session = await SessionsRepo.getSessionById(id);
    let questions = await SessionsRepo.getQuestions(id);
    expect(questions.length).toEqual(0);

    const question1 = await QuestionsRepo.createQuestion('Question1', session, user);
    const question2 = await QuestionsRepo.createQuestion('Question2', session, user2);
    questions = await SessionsRepo.getQuestions(id);
    expect(questions.length).toEqual(2);

    await QuestionsRepo.deleteQuestionById(question1.id);
    await QuestionsRepo.deleteQuestionById(question2.id);
});

test('Delete Session', async () => {
    await SessionsRepo.deleteSessionById(id);
    await SessionsRepo.deleteSessionById(id2);
    expect(await SessionsRepo.getSessionById(id)).not.toBeDefined();
    expect(await SessionsRepo.getSessionById(id2)).not.toBeDefined();
});

// Teardown
afterAll(async () => {
    await UsersRepo.deleteUserById(user.id);
    await UsersRepo.deleteUserById(user2.id);
    await UsersRepo.deleteUserById(user3.id);
    await UsersRepo.deleteUserById(user4.id);
    console.log('Passed all session tests');
});
