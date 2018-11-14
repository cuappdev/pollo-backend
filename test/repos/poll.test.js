import GroupsRepo from '../../src/repos/GroupsRepo';
import PollsRepo from '../../src/repos/PollsRepo';
import UsersRepo from '../../src/repos/UsersRepo';
import dbConnection from '../../src/db/DbConnection';

let id;
let id2;
let group;
let group2;
let user;

// Connects to db before running tests and does setup
beforeAll(async () => {
    await dbConnection().catch((e) => {
        console.log('Error connecting to database');
        process.exit();
    });
    user = await UsersRepo.createDummyUser('1234');
    group = await GroupsRepo
        .createGroup('Group', GroupsRepo.createCode(), user);
    group2 = await GroupsRepo
        .createGroup('Group2', GroupsRepo.createCode(), user);
});

test('Create Poll', async () => {
    const poll = await PollsRepo
        .createPoll('Poll', group, {}, true, 'MULTIPLE_CHOICE', 'A');
    expect(poll.text).toBe('Poll');
    expect(poll.group.id).toBe(group.id);
    expect(poll.results).toEqual({});
    expect(poll.shared).toBe(true);
    expect(poll.type).toBe('MULTIPLE_CHOICE');
    expect(poll.userAnswers).toEqual({});
    expect(poll.correctAnswer).toBe('A');
    ({ id } = poll);

    const poll2 = await PollsRepo.createPoll('', group, {}, false, 'FREE_RESPONSE', '', {});
    expect(poll2.text).toBe('');
    expect(poll2.group.id).toBe(group.id);
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

test('Get Group from Poll', async () => {
    const p = await PollsRepo.getGroupFromPollId(id);
    expect(p.id).toBe(group.id);
});

test('Get Polls from Group', async () => {
    await PollsRepo
        .createPoll('Another poll', group, {}, true, 'FREE_RESPONSE', '');
    let polls = await GroupsRepo.getPolls(group.id, false);
    expect(polls.length).toBe(3);
    polls = await GroupsRepo.getPolls(group.id, true);
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
    await GroupsRepo.deleteGroupById(group.id);
    await GroupsRepo.deleteGroupById(group2.id);
    await UsersRepo.deleteUserById(user.id);
    console.log('Passed all poll tests');
});
