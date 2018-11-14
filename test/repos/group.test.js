import GroupsRepo from '../../src/repos/GroupsRepo';
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

test('Create Group', async () => {
    code = GroupsRepo.createCode();
    code2 = GroupsRepo.createCode();
    user = await UsersRepo.createDummyUser('grouptest1');

    const group = await GroupsRepo.createGroup('Group', code, user);
    expect(group.name).toBe('Group');
    expect(group.code).toBe(code);
    expect(group.admins.length).toEqual(1);
    expect(group.admins[0].googleId).toBe(user.googleId);
    expect(group.members.length).toEqual(0);
    ({ id } = group);

    const group2 = await GroupsRepo.createGroup('NewGroup', code2);
    expect(group2.admins.length).toEqual(0);
    expect(group.members.length).toEqual(0);
    id2 = group2.id;
});

test('Get Group by Id', async () => {
    const group = await GroupsRepo.getGroupById(id);
    expect(group.name).toBe('Group');
    expect(group.code).toBe(code);

    const group2 = await GroupsRepo.getGroupById(id2);
    expect(group2.name).toBe('NewGroup');
    expect(group2.code).toBe(code2);
});

test('Get Group by Code', async () => {
    const tempid = await GroupsRepo.getGroupId(code);
    expect(tempid).toBe(id);
});

test('Update Group', async () => {
    const group = await GroupsRepo.updateGroupById(id, 'Update Group');
    expect(group.id).toBe(id);
    expect(group.name).toBe('Update Group');
});

test('Get Admins from Group', async () => {
    const admins = await GroupsRepo.getUsersByGroupId(id, 'admin');
    expect(admins.length).toEqual(1);
    expect(admins[0].googleId).toBe(user.googleId);

    const admins2 = await GroupsRepo.getUsersByGroupId(id2, 'admin');
    expect(admins2.length).toEqual(0);
});

test('Add Admin to Group by Id', async () => {
    user2 = await UsersRepo.createDummyUser('grouptest2');
    user3 = await UsersRepo.createDummyUser('grouptest3');
    user4 = await UsersRepo.createDummyUser('grouptest4');

    const { admins } = await GroupsRepo.addUsersByIds(id, [user2.id], 'admin');
    expect(admins.length).toEqual(2);
    expect(admins[1].googleId).toBe(user2.googleId);

    const group = await GroupsRepo.addUsersByIds(id2, [user3.id, user4.id], 'admin');
    expect(group.admins.length).toEqual(2);
    expect(group.admins[0].googleId).toBe(user3.googleId);
    expect(group.admins[1].googleId).toBe(user4.googleId);
});

test('Remove Admin from Group', async () => {
    const group = await GroupsRepo.removeUserByGroupId(id, user2, 'admin');
    expect(group.admins.length).toEqual(1);
    expect(group.admins[0].googleId).toBe(user.googleId);
    ({ id } = group);

    expect(await GroupsRepo.isAdmin(id, user2)).toBe(false);
    expect(await GroupsRepo.isMember(id, user2)).toBe(false);
    expect(await GroupsRepo.isAdmin(id, user)).toBe(true);
    expect(await GroupsRepo.isMember(id, user)).toBe(false);

    await GroupsRepo.removeUserByGroupId(id2, user3, 'admin');
    const group2 = await GroupsRepo.removeUserByGroupId(id2, user4, 'admin');
    expect(group2.admins.length).toEqual(0);
});

test('Add Admin to Group by GoogleId', async () => {
    const { admins } = (await GroupsRepo.addUsersByGoogleIds(id, [user2.googleId], 'admin'));
    expect(admins.length).toEqual(2);
    expect(admins[1].id).toBe(user2.id);

    const group = await GroupsRepo.removeUserByGroupId(id, user2, 'admin');
    expect(group.admins.length).toEqual(1);
    ({ id } = group);

    let group2 = await GroupsRepo.addUsersByGoogleIds(id2, [user3.googleId, user4.googleId], 'admin');
    expect(group2.admins.length).toEqual(2);
    expect(group2.admins[0].id).toBe(user3.id);
    expect(group2.admins[1].id).toBe(user4.id);

    await GroupsRepo.removeUserByGroupId(id2, user3, 'admin');
    group2 = await GroupsRepo.removeUserByGroupId(id2, user4, 'admin');
    expect(group2.admins.length).toEqual(0);
});

test('Add Member to Group by GoogleId', async () => {
    const { members } = (await GroupsRepo.addUsersByGoogleIds(id, [user2.googleId], 'member'));
    expect(members.length).toEqual(1);
    expect(members[0].id).toBe(user2.id);

    const group = await GroupsRepo.addUsersByGoogleIds(id2, [user3.googleId, user4.googleId]);
    expect(group.members.length).toEqual(2);
    expect(group.members[0].id).toBe(user3.id);
    expect(group.members[1].id).toBe(user4.id);
});

test('Get Members of Group', async () => {
    const members = await GroupsRepo.getUsersByGroupId(id, 'member');
    expect(members.length).toEqual(1);
    expect(members[0].googleId).toBe(user2.googleId);

    const members2 = await GroupsRepo.getUsersByGroupId(id2, 'member');
    expect(members2.length).toEqual(2);
    expect(members2[0].id).toBe(user3.id);
    expect(members2[1].id).toBe(user4.id);
});

test('Get All Users of Group', async () => {
    const users = await GroupsRepo.getUsersByGroupId(id);
    expect(users.length).toEqual(2);
    expect(users[0].id).toBe(user.id);
    expect(users[1].id).toBe(user2.id);

    const users2 = await GroupsRepo.getUsersByGroupId(id2);
    expect(users2.length).toEqual(2);
});

test('Remove Member from Group', async () => {
    const group = await GroupsRepo.removeUserByGroupId(id, user2, 'member');
    expect(group.members.length).toEqual(0);
    ({ id } = group);

    await GroupsRepo.removeUserByGroupId(id2, user3, 'member');
    const group2 = await GroupsRepo.removeUserByGroupId(id2, user4);
    expect(group2.members.length).toEqual(0);
});

test('Add Members to Group by Id', async () => {
    let { members } = (await GroupsRepo.addUsersByIds(id, [user2.id], 'member'));
    expect(members.length).toEqual(1);
    expect(members[0].googleId).toBe(user2.googleId);

    ({ members } = await GroupsRepo.addUsersByIds(id, [user3.id, user4.id]));
    expect(members.length).toEqual(3);

    let group = await GroupsRepo.removeUserByGroupId(id, user3, 'member');
    group = await GroupsRepo.removeUserByGroupId(id, user4, 'member');
    ({ id } = group);
});

test('Get Polls from Group', async () => {
    const group = await GroupsRepo.getGroupById(id);
    let polls = await GroupsRepo.getPolls(id);
    expect(polls.length).toEqual(0);

    const poll = await PollsRepo.createPoll('Poll', group, {}, true, 'MULTIPLE_CHOICE', '');
    const poll2 = await PollsRepo.createPoll('', group, {}, false, 'FREE_RESPONSE', '', {});
    polls = await GroupsRepo.getPolls(id, true);
    expect(polls.length).toEqual(1);
    expect(polls[0].id).toBe(poll.id);
    polls = await GroupsRepo.getPolls(id, false);
    expect(polls.length).toEqual(2);
    expect(polls[0].id).toBe(poll.id);
    expect(polls[1].id).toBe(poll2.id);

    await PollsRepo.deletePollById(poll.id);
    await PollsRepo.deletePollById(poll2.id);
});

test('Get Questions from Group', async () => {
    const group = await GroupsRepo.getGroupById(id);
    let questions = await GroupsRepo.getQuestions(id);
    expect(questions.length).toEqual(0);

    const question1 = await QuestionsRepo.createQuestion('Question1', group, user);
    const question2 = await QuestionsRepo.createQuestion('Question2', group, user2);
    questions = await GroupsRepo.getQuestions(id);
    expect(questions.length).toEqual(2);

    await QuestionsRepo.deleteQuestionById(question1.id);
    await QuestionsRepo.deleteQuestionById(question2.id);
});

test('Delete Group', async () => {
    await GroupsRepo.deleteGroupById(id);
    await GroupsRepo.deleteGroupById(id2);
    expect(await GroupsRepo.getGroupById(id)).not.toBeDefined();
    expect(await GroupsRepo.getGroupById(id2)).not.toBeDefined();
});

// Teardown
afterAll(async () => {
    await UsersRepo.deleteUserById(user.id);
    await UsersRepo.deleteUserById(user2.id);
    await UsersRepo.deleteUserById(user3.id);
    await UsersRepo.deleteUserById(user4.id);
    console.log('Passed all group tests');
});
