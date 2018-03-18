// import dbConnection from '../../src/db/DbConnection';
// import UsersRepo from '../../src/repos/UsersRepo';
// import SessionsRepo from '../../src/repos/SessionsRepo';
// const request = require('request-promise-native');
// const { get, post, del, put } = require('./lib');
//
// // Polls
// // Must be running server to test
//
// const opts = {name: 'Test poll', code: 'ABC123', deviceId: 'IPHONE'};
// const opts2 = {name: 'New poll', deviceId: 'IPHONE'};
// const opts3 = {name: 'New poll', deviceId: 'invalid'};
// const googleId = 'usertest';
// var token, session, pollres, userId;
//
// beforeAll(async () => {
//   await dbConnection().catch(function (e) {
//     console.log('Error connecting to database');
//     process.exit();
//   });
//   const user = await UsersRepo.createDummyUser(googleId);
//   userId = user.id;
//   session = await SessionsRepo.createOrUpdateSession(user, null, null);
//   token = session.sessionToken;
// });
//
// test('create poll', async () => {
//   const result = await request(post('/polls/', opts, token));
//   console.log(result);
//   pollres = JSON.parse(result);
//   expect(pollres.success).toBeTruthy();
// });
//
// test('get single poll', async () => {
//   const getstr = await request(get(`/polls/${pollres.data.node.id}`, token));
//   const getres = JSON.parse(getstr);
//   expect(getres.success).toBeTruthy();
//   expect(pollres).toMatchObject(getres);
// });
//
// test('update poll', async () => {
//   const getstr = await request(put(`/polls/${pollres.data.node.id}`, opts2, token));
//   const getres = JSON.parse(getstr);
//   expect(getres.success).toBeTruthy();
//   expect(getres.data.node.name).toBe('New poll');
// });
//
// test('update poll with invalid token', async () => {
//   const getstr = await request(put(`/polls/${pollres.data.node.id}`, opts3, 'invalid'));
//   const getres = JSON.parse(getstr);
//   expect(getres.success).toBeFalsy();
// });
//
// test('delete poll with invalid device id', async () => {
//   const result =
//     await request(del(`/polls/${pollres.data.node.id}`, 'invalid'));
//   expect(JSON.parse(result).success).toBeFalsy();
// });
//
// test('delete poll', async () => {
//   const result =
//     await request(del(`/polls/${pollres.data.node.id}/${opts.deviceId}`, token));
//   expect(JSON.parse(result).success).toBeTruthy();
// });
// afterAll(async () => {
//   await dbConnection().catch(function (e) {
//     console.log('Error connecting to database');
//     process.exit();
//   });
//   await UsersRepo.deleteUserById(userId);
//   await SessionsRepo.deleteSession(session.id);
// });

test('placeholder', () => {
  expect(1 + 1).toBe(2);
});
