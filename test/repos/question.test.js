import PollsRepo from '../../src/repos/PollsRepo';
import QuestionsRepo from '../../src/repos/QuestionsRepo';
import UsersRepo from '../../src/repos/UsersRepo';
import dbConnection from '../../src/db/DbConnection';

var poll;
var id;
var user;

// Connects to db before running tests and does setup
beforeAll(async () => {
  await dbConnection().catch(function (e) {
    console.log('Error connecting to database');
    process.exit();
  });
  user = await UsersRepo.createDummyUser('1234');
  poll = await PollsRepo.createPoll('Poll', PollsRepo.createCode(), user);
});

test('Create Question', async () => {
  const question = await QuestionsRepo.createQuestion('Question', poll, {});
  expect(question.text).toBe('Question');
  expect(question.poll.id).toBe(poll.id);
  expect(question.results).toEqual({});
  id = question.id;
});

test('Get Question', async () => {
  const question = await QuestionsRepo.getQuestionById(id);
  expect(question.text).toBe('Question');
  expect(question.results).toEqual({});
});

test('Update Question', async () => {
  const question = await QuestionsRepo.updateQuestionById(id, 'New Question');
  expect(question.text).toBe('New Question');
});

test('Get Questions from Poll', async () => {
  const questions = await QuestionsRepo.getQuestionsFromPollId(poll.id);
  expect(questions.length).toEqual(1);
  expect(questions[0].text).toBe('New Question');
});

test('Get Poll from Question', async () => {
  const p = await QuestionsRepo.getPollFromQuestionId(id);
  expect(p.id).toBe(poll.id);
});

test('Delete Question', async () => {
  await QuestionsRepo.deleteQuestionById(id);
  expect(await QuestionsRepo.getQuestionById(id)).not.toBeDefined();
});

// Teardown
afterAll(async () => {
  await PollsRepo.deletePollById(poll.id);
  console.log('Passed all tests');
});
