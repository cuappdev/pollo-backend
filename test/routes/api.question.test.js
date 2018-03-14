// const request = require('request-promise-native');
// const { get, post, del, put } = require('./lib');
//
// // Questions
// // Must be running server to test
//
// var poll;
// var question;
// var deviceId;
//
// beforeAll(async () => {
//   // Create a poll
//   const opts = {name: 'Test poll', code: '123456', deviceId: 'IPHONE'};
//   deviceId = 'IPHONE';
//   const result = await request(post('/polls/', opts));
//   poll = JSON.parse(result).data.node;
//   expect(JSON.parse(result).success).toBeTruthy();
// });
//
// test('create question', async () => {
//   const opts = {text: 'Question text', results: {}, deviceId: 'IPHONE'};
//   const result = await request(post(`/polls/${poll.id}/question`, opts));
//   question = JSON.parse(result).data.node;
//   expect(JSON.parse(result).success).toBeTruthy();
// });
//
// test('get question', async () => {
//   const getstr = await request(get(`/questions/${question.id}`));
//   const getres = JSON.parse(getstr);
//   expect(getres.success).toBeTruthy();
//   expect(question).toMatchObject(getres.data.node);
// });
//
// test('get questions', async () => {
//   const getstr = await request(get(`/polls/${poll.id}/questions`));
//   const getres = JSON.parse(getstr);
//   expect(getres.success).toBeTruthy();
//   expect(question).toMatchObject(getres.data.edges[0].node);
// });
//
// test('update question', async () => {
//   const opts = {
//     text: 'Updated text',
//     results: JSON.stringify({'A': 1}),
//     deviceId: 'IPHONE'
//   };
//   const getstr = await request(put(`/questions/${question.id}`, opts));
//   const getres = JSON.parse(getstr);
//   expect(getres.success).toBeTruthy();
//   expect(getres.data.node.text).toBe('Updated text');
//   expect(getres.data.node.results).toMatchObject({'A': 1});
// });
//
// test('delete question', async () => {
//   const result = await request(del(`/questions/${question.id}/${deviceId}`));
//   expect(JSON.parse(result).success).toBeTruthy();
// });
//
// afterAll(async () => {
//   const result =
//     await request(del(`/polls/${poll.id}/${deviceId}`));
//   expect(JSON.parse(result).success).toBeTruthy();
// });

test('placeholder', () => {
  expect(1 + 1).toBe(2);
});
