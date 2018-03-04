const request = require('request-promise-native');
const { get, post, del, put } = require('./lib');

// Polls
// Must be running server to test

const opts = {name: 'Test poll', code: 'ABC123'};
const opts2 = {name: 'New poll'};
var pollres;

test('create poll', async () => {
  const result = await request(post('/polls/', opts));
  pollres = JSON.parse(result);
  expect(pollres.success).toBeTruthy();
});

test('get single poll', async () => {
  const getstr = await request(get(`/polls/${pollres.data.node.id}`));
  const getres = JSON.parse(getstr);
  expect(getres.success).toBeTruthy();
  expect(pollres).toMatchObject(getres);
});

test('update poll', async () => {
  const getstr = await request(put(`/polls/${pollres.data.node.id}`, opts2));
  const getres = JSON.parse(getstr);
  expect(getres.success).toBeTruthy();
  expect(getres.data.node.name).toBe('New poll');
});

test('delete poll', async () => {
  const result = await request(del(`/polls/${pollres.data.node.id}`));
  expect(JSON.parse(result).success).toBeTruthy();
});
