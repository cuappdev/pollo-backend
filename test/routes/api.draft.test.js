import request from 'request-promise-native';
import dbConnection from '../../src/db/DbConnection';
import UsersRepo from '../../src/repos/UsersRepo';
import UserSessionsRepo from '../../src/repos/UserSessionsRepo';

const {
  get, post, del, put,
} = require('./lib');

let draft1;
let draft2;
let userID;
let userToken;
let session;

const body1 = {
  text: 'Test draft',
  options: ['yes', 'no'],
};

const body2 = {
  text: 'Another One ... DJ Khaled',
  options: ['yes'],
};

beforeAll(async () => {
  await dbConnection().catch((e) => {
    // eslint-disable-next-line no-console
    console.log('Error connecting to database');
    process.exit();
  });
});

beforeEach(async () => {
  const user = await UsersRepo.createDummyUser('googleID');
  userID = user.uuid;
  session = await UserSessionsRepo.createOrUpdateSession(user, null, null);
  userToken = session.sessionToken;

  await request(post('/drafts/', body1, userToken)).then((getres) => {
    draft1 = getres.data;
    expect(getres.success).toBe(true);
    expect(draft1).toMatchObject(body1);
  });
});

test('Create a draft', async () => {
  await request(post('/drafts/', body2, userToken)).then((getres) => {
    draft2 = getres.data;
    expect(getres.success).toBe(true);
    expect(draft2).toMatchObject(body2);
  });
});

test('Get drafts (Authorized)', async () => {
  await request(get('/drafts/', userToken)).then((getres) => {
    const drafts = getres.data;
    expect(getres.success).toBe(true);
    expect(drafts.length).toBe(1);
    expect(drafts[0]).toMatchObject(draft1);
  });
});

test('Get drafts (Unauthorized)', async () => {
  await request(get('/drafts/', 'blah'))
    .catch((e) => {
      expect(e.statusCode).toBe(401);
    });
});

test('Update a draft', async () => {
  const body = {
    text: 'Test draft updated',
  };
  await request(put(`/drafts/${draft1.id}/`, body, userToken)).then((getres) => {
    const draft = getres.data;
    expect(getres.success).toBe(true);
    expect(draft.text).toBe(body.text);
    expect(draft.options).toMatchObject(draft1.options);
    expect(draft.id).toBe(draft1.id);
    expect(draft.createdAt).toBe(draft1.createdAt);
    draft1 = draft;
  });
});

test('Get updated list of drafts (Authorized)', async () => {
  await request(post('/drafts/', body2, userToken)).then((getres) => {
    draft2 = getres.data;
    expect(getres.success).toBe(true);
    expect(draft2).toMatchObject(body2);
  });

  await request(get('/drafts/', userToken)).then((getres) => {
    const drafts = getres.data;
    expect(getres.success).toBe(true);
    expect(drafts.length).toBe(2);
    expect(drafts[0]).toMatchObject(draft1);
    expect(drafts[1]).toMatchObject(draft2);
  });
});

test('Delete draft', async () => {
  await request(post('/drafts/', body2, userToken)).then((getres) => {
    draft2 = getres.data;
    expect(getres.success).toBe(true);
    expect(draft2).toMatchObject(body2);
  });

  await request(del(`/drafts/${draft1.id}`, userToken)).then((result) => {
    expect(result.success).toBe(true);
  });
  await request(del(`/drafts/${draft2.id}`, userToken)).then((result) => {
    expect(result.success).toBe(true);
  });
});

afterEach(async () => {
  await request(del(`/drafts/${draft1.id}`, userToken));

  if (draft2 !== undefined) {
    await request(del(`/drafts/${draft2.id}`, userToken));
  }
  await UsersRepo.deleteUserByID(userID);
  await UserSessionsRepo.deleteSession(session.uuid);
});

afterAll(async () => {
  console.log('Passed all draft tests');
});
