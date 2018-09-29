import SessionsRepo from '../../src/repos/SessionsRepo';
import PollsRepo from '../../src/repos/PollsRepo';
import UsersRepo from '../../src/repos/UsersRepo';
import dbConnection from '../../src/db/DbConnection';

let session;
let id;
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
});

test('Create Poll', async () => {
    const poll = await PollsRepo.createPoll('Poll', session, {}, true, 'MULTIPLE_CHOICE');
    expect(poll.text).toBe('Poll');
    expect(poll.session.id).toBe(session.id);
    expect(poll.results).toEqual({});
    expect(poll.type).toBe('MULTIPLE_CHOICE');
    ({ id } = poll);
});

test('Get Poll', async () => {
    const poll = await PollsRepo.getPollById(id);
    expect(poll.text).toBe('Poll');
    expect(poll.results).toEqual({});
    expect(poll.type).toBe('MULTIPLE_CHOICE');
});

test('Update Poll', async () => {
    const poll = await PollsRepo.updatePollById(id, 'New Poll', null, false);
    expect(poll.text).toBe('New Poll');
    expect(poll.shared).toBe(false);
});

test('Get Session from Poll', async () => {
    const p = await PollsRepo.getSessionFromPollId(id);
    expect(p.id).toBe(session.id);
});

test('Get Polls from Session', async () => {
    const poll = await PollsRepo
        .createPoll('Another poll', session, {}, true, 'FREE_RESPONSE');
    const polls = await SessionsRepo.getPolls(session.id, false);
    expect(polls.length > 1).toBe(true);
    expect(polls[1].id).toBe(poll.id);
    expect(polls[0].id).toBe(id);
});

test('Delete Poll', async () => {
    await PollsRepo.deletePollById(id);
    expect(await PollsRepo.getPollById(id)).not.toBeDefined();
});

// Teardown
afterAll(async () => {
    await SessionsRepo.deleteSessionById(session.id);
    await UsersRepo.deleteUserById(user.id);
    console.log('Passed all poll tests');
});
