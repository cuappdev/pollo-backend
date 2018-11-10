import SessionsRepo from '../../src/repos/SessionsRepo';
import PollsRepo from '../../src/repos/PollsRepo';
import UsersRepo from '../../src/repos/UsersRepo';
import dbConnection from '../../src/db/DbConnection';

let id;
let id2;
let session;
let session2;
let user;

// Connects to db before running tests and does setup
beforeAll(async () => {
    await dbConnection().catch((e) => {
        console.log('Error connecting to database');
        process.exit();
    });
    user = await UsersRepo.createDummyUser('1234');
    session = await SessionsRepo
        .createSession('Session', SessionsRepo.createCode(), user);
    session2 = await SessionsRepo
        .createSession('Session2', SessionsRepo.createCode(), user);
});

test('Create Poll', async () => {
    const poll = await PollsRepo
        .createPoll('Poll', session, {}, true, 'MULTIPLE_CHOICE', 'A');
    expect(poll.text).toBe('Poll');
    expect(poll.session.id).toBe(session.id);
    expect(poll.results).toEqual({});
    expect(poll.shared).toBe(true);
    expect(poll.type).toBe('MULTIPLE_CHOICE');
    expect(poll.userAnswers).toEqual({});
    expect(poll.correctAnswer).toBe('A');
    ({ id } = poll);

    const poll2 = await PollsRepo.createPoll('', session, {}, false, 'FREE_RESPONSE', '', {});
    expect(poll2.text).toBe('');
    expect(poll2.session.id).toBe(session.id);
    expect(poll2.results).toEqual({});
    expect(poll2.shared).toBe(false);
    expect(poll2.type).toBe('FREE_RESPONSE');
    expect(poll2.userAnswers).toEqual({});
    expect(poll2.correctAnswer).toBe('');
    id2 = poll2.id;
});

test('Get Poll', async () => {
    const poll = await PollsRepo.getPollById(id);
    expect(poll.text).toBe('Poll');
    expect(poll.shared).toBe(true);
    expect(poll.type).toBe('MULTIPLE_CHOICE');

    const poll2 = await PollsRepo.getPollById(id2);
    expect(poll2.text).toBe('');
    expect(poll2.shared).toBe(false);
    expect(poll2.type).toBe('FREE_RESPONSE');
});

test('Update Poll', async () => {
    const poll = await PollsRepo.updatePollById(id, 'New Poll', null, false);
    expect(poll.text).toBe('New Poll');
    expect(poll.shared).toBe(false);

    const poll2 = await PollsRepo.updatePollById(id2, '', { user: 'result' });
    expect(poll2.text).toBe('');
    expect(poll2.results.user).toBe('result');
});

test('Get Session from Poll', async () => {
    const p = await PollsRepo.getSessionFromPollId(id);
    expect(p.id).toBe(session.id);
});

test('Get Polls from Session', async () => {
    await PollsRepo
        .createPoll('Another poll', session, {}, true, 'FREE_RESPONSE', '');
    let polls = await SessionsRepo.getPolls(session.id, false);
    expect(polls.length).toBe(3);
    polls = await SessionsRepo.getPolls(session.id, true);
    expect(polls.length).toBe(1);
});

test('Delete Poll', async () => {
    await PollsRepo.deletePollById(id);
    await PollsRepo.deletePollById(id2);
    expect(await PollsRepo.getPollById(id)).not.toBeDefined();
    expect(await PollsRepo.getPollById(id2)).not.toBeDefined();
});

// Teardown
afterAll(async () => {
    await SessionsRepo.deleteSessionById(session.id);
    await SessionsRepo.deleteSessionById(session2.id);
    await UsersRepo.deleteUserById(user.id);
    console.log('Passed all poll tests');
});
