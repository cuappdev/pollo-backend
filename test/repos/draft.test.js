import DraftsRepo from '../../src/repos/DraftsRepo';
import UsersRepo from '../../src/repos/UsersRepo';
import dbConnection from '../../src/db/DbConnection';

let draft1;
let draft2;
let draft3;
let user1;
let user2;

// Connects to db before running tests and does setup
beforeAll(async () => {
    await dbConnection().catch((e) => {
        // eslint-disable-next-line no-console
        console.log('Error connecting to database');
        process.exit();
    });
    user1 = await UsersRepo.createDummyUser('1234');
    user2 = await UsersRepo.createDummyUser('ABCD');
});

test('Create Draft', async () => {
    draft1 = await DraftsRepo.createDraft('What\'s up?', ['A', 'B', 'C', 'D'], user1);
    expect(draft1.text).toBe('What\'s up?');
    expect(draft1.options).toEqual(['A', 'B', 'C', 'D']);
    expect(draft1.user).toEqual(user1);

    draft2 = await DraftsRepo.createDraft('Are you awake?', [], user1);
    expect(draft2.text).toBe('Are you awake?');
    expect(draft2.options).toEqual([]);
    expect(draft2.user).toEqual(user1);

    draft3 = await DraftsRepo.createDraft('', ['AB'], user1);
    expect(draft3.text).toBe('');
    expect(draft3.options).toEqual(['AB']);
    expect(draft3.user).toEqual(user1);
});

test('Get Draft', async () => {
    const temp = await DraftsRepo.getDraft(draft1.id);
    expect(temp.text).toBe(draft1.text);
    expect(temp.options).toEqual(draft1.options);
    expect(temp.user.id).toEqual(draft1.user.id);

    const temp2 = await DraftsRepo.getDraft(draft2.id);
    expect(temp2.text).toBe(draft2.text);
    expect(temp2.options).toEqual(draft2.options);
    expect(temp2.user.id).toEqual(draft2.user.id);

    const temp3 = await DraftsRepo.getDraft(draft3.id);
    expect(temp3.text).toBe(draft3.text);
    expect(temp3.options).toEqual(draft3.options);
    expect(temp3.user.id).toEqual(draft3.user.id);
});

test('Get Drafts from User', async () => {
    const drafts = await DraftsRepo.getDraftsByUser(user1.id);
    expect(drafts.length).toBe(3);
    expect(drafts[0].id).toBe(draft1.id);
    expect(drafts[1].id).toBe(draft2.id);
    expect(drafts[2].id).toBe(draft3.id);

    const drafts2 = await DraftsRepo.getDraftsByUser(user2.id);
    expect(drafts2.length).toBe(0);
});

test('Update Draft', async () => {
    const newDraft = await DraftsRepo.updateDraft(draft1.id, 'New Question', []);
    expect(newDraft.text).toBe('New Question');
    expect(newDraft.options).toEqual([]);
    expect(newDraft.id).toBe(draft1.id);
    draft1 = newDraft;

    const newDraft2 = await DraftsRepo.updateDraft(draft2.id, '', ['hi', 'hello']);
    expect(newDraft2.text).toBe('');
    expect(newDraft2.options).toEqual(['hi', 'hello']);
    expect(newDraft2.id).toBe(draft2.id);
    draft2 = newDraft2;
});

test('Get Owner of Draft', async () => {
    const user = await DraftsRepo.getOwnerByID(draft1.id);
    expect(user.id).toBe(user1.id);
});

test('Delete Draft', async () => {
    await DraftsRepo.deleteDraft(draft1.id);
    await DraftsRepo.deleteDraft(draft2.id);
    await DraftsRepo.deleteDraft(draft3.id);
    expect(await DraftsRepo.getDraft(draft1.id)).toBeFalsy();
    expect(await DraftsRepo.getDraft(draft2.id)).toBeFalsy();
    expect(await DraftsRepo.getDraft(draft3.id)).toBeFalsy();
});

// Teardown
afterAll(async () => {
    await UsersRepo.deleteUserByID(user1.id);
    await UsersRepo.deleteUserByID(user2.id);
    // eslint-disable-next-line no-console
    console.log('Passed all draft tests');
});
