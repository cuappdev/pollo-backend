import PollsRepo from '../src/repos/PollsRepo';
import QuestionsRepo from '../src/repos/QuestionsRepo';
import dbConnection from '../src/db/DbConnection';

var poll;

// Connects to db before running tests and does setup
beforeAll(async () => {
  await dbConnection().catch(function (e) {
    console.log('Error connecting to database');
    process.exit();
  });

  poll = await PollsRepo.createPoll('Poll', PollsRepo.createCode());
});

test('Create Question', async () => {
  const question = await QuestionsRepo.createQuestion('Question', poll, {});
  expect(question.text).toBe('Question');
  expect(question.poll.id).toBe(poll.id);
  expect(question.results).toEqual({});
});

// Teardown
afterAll(async () => {
  await QuestionsRepo.deleteQuestionById(poll.id);
  console.log('Passed all tests');
});
