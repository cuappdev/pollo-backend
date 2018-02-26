import PollsRepo from '../src/repos/PollsRepo';
import dbConnection from '../src/db/DbConnection';

var id;
var code;

// Connects to db before running tests and does setup
beforeAll(async () => {
  await dbConnection().catch(function (e) {
    console.log('Error connecting to database');
    process.exit();
  });
});

test('Create Poll', async () => {
  code = PollsRepo.createCode();
  const poll = await PollsRepo.createPoll('Poll', code);
  expect(poll.name).toBe('Poll');
  expect(poll.code).toBe(code);
  id = poll.id;
});

test('Get Poll', async () => {
  const poll = await PollsRepo.getPollById(id);
  expect(poll.name).toBe('Poll');
  expect(poll.code).toBe(code);
});

test('Update Poll', async () => {
  const poll = await PollsRepo.updatePollById(id, 'New Poll');
  expect(poll.name).toBe('New Poll');
});

test('Delete Poll', async () => {
  await PollsRepo.deletePollById(id);
  expect(await PollsRepo.getPollById(id)).not.toBeDefined();
});

// Teardown
afterAll(async () => {
  console.log('Passed all tests');
});
