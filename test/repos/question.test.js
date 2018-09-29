import SessionsRepo from '../../src/repos/SessionsRepo';
import QuestionsRepo from '../../src/repos/QuestionsRepo';
import UsersRepo from '../../src/repos/UsersRepo';
import dbConnection from '../../src/db/DbConnection';

let question1;
let question2;
let question3;
let session;
let session2;
let user;

beforeAll(async () => {
    await dbConnection().catch((e) => {
        console.log('Error connecting to database');
        process.exit();
    });
    user = await UsersRepo.createDummyUser('googleId');
    session = await SessionsRepo.createSession('Session', SessionsRepo.createCode(), user);
    session2 = await SessionsRepo.createSession('Session2', SessionsRepo.createCode(), user);
});

test('Create Question', async () => {
    const text = 'Why do we have to test shit? (PG-13)';
    question1 = await QuestionsRepo.createQuestion(text, session, user);
    expect(question1.text).toBe(text);
    expect(question1.session.id).toBe(session.id);
    expect(question1.user.id).toBe(user.id);

    question3 = await QuestionsRepo.createQuestion('', session, user);
    expect(question3.text).toBe('');
    expect(question3.session.id).toBe(session.id);
    expect(question3.user.id).toBe(user.id);
});

test('Get Question', async () => {
    const question = await QuestionsRepo.getQuestionById(question1.id);
    expect(question.id).toBe(question1.id);
    expect(question.text).toBe(question1.text);

    const questionThree = await QuestionsRepo.getQuestionById(question3.id);
    expect(questionThree.id).toBe(question3.id);
    expect(questionThree.text).toBe(question3.text);
});

test('Update Question', async () => {
    const text = 'Why do we have to test stuff? (PG)';
    const question = await QuestionsRepo.updateQuestionById(question1.id, '');
    expect(question.id).toBe(question1.id);
    expect(question.text).toBe('');
    question1.text = question.text;
});

test('Create A New Question', async () => {
    const text = 'Why is testing so annoying?';
    question2 = await QuestionsRepo.createQuestion(text, session, user);
    expect(question2.text).toBe(text);
    expect(question2.user.id).toBe(user.id);
    expect(question2.session.id).toBe(session.id);
});

test('Get Session from Both Questions', async () => {
    let temp = await QuestionsRepo.getSessionFromQuestionId(question1.id);
    expect(temp.id).toBe(session.id);
    temp = await QuestionsRepo.getSessionFromQuestionId(question2.id);
    expect(temp.id).toBe(session.id);
});

test('Verify Ownership', async () => {
    const tempUser = await UsersRepo.createDummyUser('wastemon');
    expect(await QuestionsRepo.isOwnerById(question1.id, user)).toBe(true);
    expect(await QuestionsRepo.isOwnerById(question2.id, user)).toBe(true);
    expect(await QuestionsRepo.isOwnerById(question1.id, tempUser)).toBe(false);
    await UsersRepo.deleteUserById(tempUser.id);
});

test('Delete Question', async () => {
    await QuestionsRepo.deleteQuestionById(question1.id);
    await QuestionsRepo.deleteQuestionById(question2.id);
    await QuestionsRepo.deleteQuestionById(question3.id);
    expect(await QuestionsRepo.getQuestionById(question1.id)).not.toBeDefined();
    expect(await QuestionsRepo.getQuestionById(question2.id)).not.toBeDefined();
    expect(await QuestionsRepo.getQuestionById(question3.id)).not.toBeDefined();
});

afterAll(async () => {
    await UsersRepo.deleteUserById(user.id);
    await SessionsRepo.deleteSessionById(session.id);
    await SessionsRepo.deleteSessionById(session2.id);
    console.log('Passed all question tests');
});
