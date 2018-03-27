import SessionsRepo from '../../src/repos/SessionsRepo';
import PollsRepo from '../../src/repos/PollsRepo';
import UsersRepo from '../../src/repos/UsersRepo';
import dbConnection from '../../src/db/DbConnection';

var session;
var id;
var user;

// Connects to db before running tests and does setup
beforeAll(async () => {
  await dbConnection().catch(function (e) {
    console.log('Error connecting to database');
    process.exit();
  });
  user = await UsersRepo.createDummyUser('1234');
  session = await SessionsRepo.createSession('Session', SessionsRepo.createCode(), user);
});

test('Create Poll', async () => {
  const poll =
    await PollsRepo.createPoll('Poll', session, {}, true);
  expect(poll.text).toBe('Poll');
  expect(poll.session.id).toBe(session.id);
  expect(poll.results).toEqual({});
  id = poll.id;
});

test('Get Poll', async () => {
  const poll = await PollsRepo.getPollById(id);
  expect(poll.text).toBe('Poll');
  expect(poll.results).toEqual({});
});

test('Get Polls from Session', async () => {
  const polls = await PollsRepo.getPollsFromSessionId(session.id);
  const sharedPolls =
    await PollsRepo.getSharedPollsFromSessionId(session.id);
  expect(polls.length).toEqual(1);
  expect(polls[0].text).toBe('Poll');
  expect(polls).toEqual(sharedPolls);
});

test('Update Poll', async () => {
  const poll =
    await PollsRepo.updatePollById(id, 'New Poll', null, false);
  expect(poll.text).toBe('New Poll');
  expect(poll.canShare).toBeFalsy();
});

test('Get Shared Polls from Session', async () => {
  const polls = await PollsRepo.getSharedPollsFromSessionId(session.id);
  expect(polls.length).toEqual(0);
});

test('Get Session from Poll', async () => {
  const p = await PollsRepo.getSessionFromPollId(id);
  expect(p.id).toBe(session.id);
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
