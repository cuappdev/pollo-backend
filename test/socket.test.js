import express from 'express';
import http from 'http';
import SocketIO from 'socket.io';

import constants from '../src/utils/Constants';
import dbConnection from '../src/db/DbConnection';
import GroupSocket from '../src/GroupSocket';
import GroupsRepo from '../src/repos/GroupsRepo';

let groupSocket;
let group;
let mockClient;
// let createdPollID;

const googleID = 'user1';
const poll = {
  answerChoices: [{
    letter: 'A',
    text: 'one',
    count: 0,
  },
  {
    letter: 'B',
    text: 'two',
    count: 0,
  }],
  correctAnswer: 'A',
  state: constants.POLL_STATES.LIVE,
  text: 'How do you spell 1?',
};

// Connects to db before running tests and does setup
beforeAll(async () => {
  await dbConnection().catch((e) => {
    // eslint-disable-next-line no-console
    console.log('Error connecting to database');
    process.exit();
  });
  const server: http.Server = http.createServer(express());
  const io = SocketIO(server);
  group = await GroupsRepo.createGroup('Group 1', 'ABC123', null, null);
  groupSocket = new GroupSocket({ group, nsp: io.of(`/${group.uuid}`), onClose: null });
  mockClient = groupSocket.nsp.to('members');
});

test('Start poll', () => {
  // eslint-disable-next-line no-underscore-dangle
  groupSocket._startPoll(poll);
  expect(groupSocket.current).toMatchObject({
    answerChoices: poll.answerChoices,
    correctAnswer: poll.correctAnswer,
    state: poll.state,
    text: poll.text,
    answers: {},
  });
});

test('Answer poll', () => {
  const submittedAnswer = { letter: 'B', text: 'two' };
  // eslint-disable-next-line no-underscore-dangle
  groupSocket._answerPoll(mockClient, googleID, submittedAnswer);

  const userAnswers = groupSocket.current.answers[googleID];
  expect(userAnswers.length).toBe(1);
  expect(userAnswers[0]).toBe(submittedAnswer);

  const pollChoice = groupSocket.current.answerChoices.find(p => p.letter === submittedAnswer.letter);
  expect(pollChoice.count).toBe(1);
});

test('Change answer', () => {
  const submittedAnswer = { letter: 'A', text: 'one' };
  // eslint-disable-next-line no-underscore-dangle
  groupSocket._answerPoll(null, googleID, submittedAnswer);
  
  const userAnswers = groupSocket.current.answers[googleID];
  expect(userAnswers.length).toBe(1);
  expect(userAnswers[0]).toBe(submittedAnswer);

  groupSocket.current.answerChoices.forEach((pollChoice) => {
    if (pollChoice.letter === submittedAnswer.letter) {
      expect(pollChoice.count).toBe(1);
    } else {
      expect(pollChoice.count).toBe(0);
    }
  });
});

test('Get current poll (user)', () => {
  // eslint-disable-next-line no-underscore-dangle
  const currPoll = groupSocket._currentPoll('member');

  expect(currPoll.answerChoices).toEqual(poll.answerChoices.map(a => ({ ...a, count: null })));
  expect(currPoll.correctAnswer).toBe(poll.correctAnswer);
  expect(currPoll.state).toBe(poll.state);
  expect(currPoll.text).toBe(poll.text);
  expect(currPoll.userAnswers[googleID]).toEqual([{ letter: 'A', text: 'one' }]);
});

test('Get current poll (admin)', () => {
  // eslint-disable-next-line no-underscore-dangle
  const currPoll = groupSocket._currentPoll('admin');

  expect(currPoll.answerChoices).toEqual(poll.answerChoices);
  expect(currPoll.correctAnswer).toBe(poll.correctAnswer);
  expect(currPoll.state).toBe(poll.state);
  expect(currPoll.text).toBe(poll.text);
  expect(currPoll.userAnswers[googleID]).toEqual([{ letter: 'A', text: 'one' }]);
});

test('Delete live poll', () => {
  // eslint-disable-next-line no-underscore-dangle
  groupSocket._deleteLivePoll();
  expect(groupSocket.current).toBeNull();
});

// test('Delete poll', async () => {
//   // eslint-disable-next-line no-underscore-dangle
//   await groupSocket._deletePoll(createdPollID);

//   const polls = await GroupsRepo.getPolls(group.uuid);
//   expect(polls.length).toBe(0);
// });

// Teardown
afterAll(async () => {
  await GroupsRepo.deleteGroupByID(group.uuid);
  // eslint-disable-next-line no-console
  console.log('Passed all socket tests');
});
