import GroupsRepo from '../../src/repos/GroupsRepo';
import QuestionsRepo from '../../src/repos/QuestionsRepo';
import UsersRepo from '../../src/repos/UsersRepo';
import dbConnection from '../../src/db/DbConnection';

let question1;
let question2;
let question3;
let group;
let group2;
let user;

beforeAll(async () => {
    await dbConnection().catch((e) => {
        // eslint-disable-next-line no-console
        console.log('Error connecting to database');
        process.exit();
    });
    user = await UsersRepo.createDummyUser('googleID');
    group = await GroupsRepo.createGroup('Group', GroupsRepo.createCode(), user);
    group2 = await GroupsRepo.createGroup('Group2', GroupsRepo.createCode(), user);
});

test('Create Question', async () => {
    const text = 'Why do we have to test s***? (PG-13)';
    question1 = await QuestionsRepo.createQuestion(text, group, user);
    expect(question1.text).toBe(text);
    expect(question1.group.id).toBe(group.id);
    expect(question1.user.id).toBe(user.id);

    question3 = await QuestionsRepo.createQuestion('', group, user);
    expect(question3.text).toBe('');
    expect(question3.group.id).toBe(group.id);
    expect(question3.user.id).toBe(user.id);
});

test('Get Question', async () => {
    const question = await QuestionsRepo.getQuestionByID(question1.id);
    expect(question.id).toBe(question1.id);
    expect(question.text).toBe(question1.text);

    const questionThree = await QuestionsRepo.getQuestionByID(question3.id);
    expect(questionThree.id).toBe(question3.id);
    expect(questionThree.text).toBe(question3.text);
});

test('Update Question', async () => {
    const text = 'Why do we have to test stuff? (PG)';
    const question = await QuestionsRepo.updateQuestionByID(question1.id, text);
    expect(question.id).toBe(question1.id);
    expect(question.text).toBe(text);
    question1.text = question.text;
});

test('Create A New Question', async () => {
    const text = 'Why is testing so annoying?';
    question2 = await QuestionsRepo.createQuestion(text, group, user);
    expect(question2.text).toBe(text);
    expect(question2.user.id).toBe(user.id);
    expect(question2.group.id).toBe(group.id);
});

test('Get Group from Both Questions', async () => {
    let temp = await QuestionsRepo.getGroupFromQuestionID(question1.id);
    expect(temp.id).toBe(group.id);
    temp = await QuestionsRepo.getGroupFromQuestionID(question2.id);
    expect(temp.id).toBe(group.id);
});

test('Verify Ownership', async () => {
    const tempUser = await UsersRepo.createDummyUser('wastemon');
    expect(await QuestionsRepo.isOwnerByID(question1.id, user)).toBe(true);
    expect(await QuestionsRepo.isOwnerByID(question2.id, user)).toBe(true);
    expect(await QuestionsRepo.isOwnerByID(question1.id, tempUser)).toBe(false);
    await UsersRepo.deleteUserByID(tempUser.id);
});

test('Delete Question', async () => {
    await QuestionsRepo.deleteQuestionByID(question1.id);
    await QuestionsRepo.deleteQuestionByID(question2.id);
    await QuestionsRepo.deleteQuestionByID(question3.id);
    expect(await QuestionsRepo.getQuestionByID(question1.id)).not.toBeDefined();
    expect(await QuestionsRepo.getQuestionByID(question2.id)).not.toBeDefined();
    expect(await QuestionsRepo.getQuestionByID(question3.id)).not.toBeDefined();
});

afterAll(async () => {
    await UsersRepo.deleteUserByID(user.id);
    await GroupsRepo.deleteGroupByID(group.id);
    await GroupsRepo.deleteGroupByID(group2.id);
    // eslint-disable-next-line no-console
    console.log('Passed all question tests');
});
