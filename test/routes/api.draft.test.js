import dbConnection from '../../src/db/DbConnection';
import UsersRepo from '../../src/repos/UsersRepo';
import UserSessionsRepo from '../../src/repos/UserSessionsRepo';
const request = require('request-promise-native');
const { get, post, del, put } = require('./lib');

var draft1, draft2, userId, userToken;

beforeAll(async () => {
  await dbConnection().catch(function (e) {
    console.log('Error connecting to database');
    process.exit();
  });
  const user = await UsersRepo.createDummyUser('googleId');
  userId = user.id;
  const session = await UserSessionsRepo.createOrUpdateSession(user, null, null);
  userToken = session.sessionToken;

  // Create a session
  const opts = {
    text: 'Test draft',
    options: ['yes', 'no']
  };
  const result = await request(post('/sessions/', opts, userToken));
  draft1 = result.data.node;
  expect(result.success).toBeTruthy();
});

test('nothing', async () => {

});
