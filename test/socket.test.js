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
let createdPollID;

const googleID = 'user1';
const googleID2 = 'user2';
const googleID3 = 'user3';
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
  type: constants.POLL_TYPES.MULTIPLE_CHOICE,
};
const pollFR = {
  answerChoices: [{
    letter: null,
    text: 'GET',
    count: 0,
  },
  {
    letter: null,
    text: 'POST',
    count: 1,
  }],
  correctAnswer: '',
  state: constants.POLL_STATES.LIVE,
  text: 'What are HTTP request types?',
  type: constants.POLL_TYPES.FREE_RESPONSE,
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
  groupSocket = new GroupSocket({ group, nsp: io.of(`/${group.id}`), onClose: null });
  mockClient = groupSocket.nsp.to('members');
});

test('Start poll (MC)', () => {
  // eslint-disable-next-line no-underscore-dangle
  groupSocket._startPoll(poll);
  expect(groupSocket.current).toMatchObject({
    answerChoices: poll.answerChoices,
    correctAnswer: poll.correctAnswer,
    state: poll.state,
    text: poll.text,
    type: poll.type,
    answers: {},
    upvotes: {},
  });
});

test('Answer poll (MC)', () => {
  const submittedAnswer = { letter: 'B', text: 'two' };
  // eslint-disable-next-line no-underscore-dangle
  groupSocket._answerPoll(mockClient, googleID, submittedAnswer);

  const userAnswers = groupSocket.current.answers[googleID];
  expect(userAnswers.length).toBe(1);
  expect(userAnswers[0]).toBe(submittedAnswer);

  const pollChoice = groupSocket.current.answerChoices.find(p => p.letter === submittedAnswer.letter);
  expect(pollChoice.count).toBe(1);
});

test('Change answer (MC)', () => {
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

test('Get current MC poll (user)', () => {
  // eslint-disable-next-line no-underscore-dangle
  const currPoll = groupSocket._currentPoll('member');

  expect(currPoll.answerChoices).toEqual(poll.answerChoices.map(a => ({ ...a, count: null })));
  expect(currPoll.correctAnswer).toBe(poll.correctAnswer);
  expect(currPoll.state).toBe(poll.state);
  expect(currPoll.text).toBe(poll.text);
  expect(currPoll.type).toBe(poll.type);
  expect(currPoll.userAnswers[googleID]).toEqual([{ letter: 'A', text: 'one' }]);
});

test('Get current MC poll (admin)', () => {
  // eslint-disable-next-line no-underscore-dangle
  const currPoll = groupSocket._currentPoll('admin');

  expect(currPoll.answerChoices).toEqual(poll.answerChoices);
  expect(currPoll.correctAnswer).toBe(poll.correctAnswer);
  expect(currPoll.state).toBe(poll.state);
  expect(currPoll.text).toBe(poll.text);
  expect(currPoll.type).toBe(poll.type);
  expect(currPoll.userAnswers[googleID]).toEqual([{ letter: 'A', text: 'one' }]);
});

test('End live poll', () => {
  // eslint-disable-next-line no-underscore-dangle
  groupSocket._deleteLivePoll();
  expect(groupSocket.current).toBeNull();
});

test('Start poll (FR)', () => {
  const clientPoll = {
    ...pollFR,
    answerChoices: [],
  };
  // eslint-disable-next-line no-underscore-dangle
  groupSocket._startPoll(clientPoll);
  expect(groupSocket.current).toMatchObject({
    answerChoices: clientPoll.answerChoices,
    correctAnswer: clientPoll.correctAnswer,
    state: clientPoll.state,
    text: clientPoll.text,
    type: clientPoll.type,
    answers: {},
    upvotes: {},
  });
});

test('Answer poll (FR)', () => {
  const submittedAnswer = { text: 'GET' };
  // eslint-disable-next-line no-underscore-dangle
  groupSocket._answerPoll(mockClient, googleID, submittedAnswer);

  const userAnswers = groupSocket.current.answers[googleID];
  const userUpvotes = groupSocket.current.upvotes[googleID];
  expect(userAnswers.length).toBe(1);
  expect(userAnswers[0]).toEqual(submittedAnswer);
  expect(userUpvotes.length).toBe(1);
  expect(userUpvotes[0]).toEqual(submittedAnswer);

  const pollChoice = groupSocket.current.answerChoices.find(p => p.text === submittedAnswer.text);
  expect(pollChoice.count).toBe(1);
  expect(pollChoice.letter).toBeNull();
});

test('Unupvote own answer (FR)', () => {
  const upvotedAnswer = { text: 'GET' };
  // eslint-disable-next-line no-underscore-dangle
  groupSocket._upvoteAnswer(mockClient, googleID, upvotedAnswer);

  const userAnswers = groupSocket.current.answers[googleID];
  const userUpvotes = groupSocket.current.upvotes[googleID];
  expect(userAnswers.length).toBe(1);
  expect(userAnswers[0]).toEqual(upvotedAnswer);
  expect(userUpvotes.length).toBe(0);

  const pollChoice = groupSocket.current.answerChoices.find(p => p.text === upvotedAnswer.text);
  expect(pollChoice.count).toBe(0);
});

test('Upvote poll (FR)', () => {
  const submittedAnswer = { text: 'POST' };
  // eslint-disable-next-line no-underscore-dangle
  groupSocket._answerPoll(mockClient, googleID, submittedAnswer);
  // eslint-disable-next-line no-underscore-dangle
  groupSocket._upvoteAnswer(mockClient, googleID2, submittedAnswer);

  const userAnswers = groupSocket.current.answers[googleID2];
  const userUpvotes = groupSocket.current.upvotes[googleID2];
  expect(userAnswers).toBeUndefined();
  expect(userUpvotes.length).toBe(1);
  expect(userUpvotes[0]).toEqual(submittedAnswer);

  const pollChoice = groupSocket.current.answerChoices.find(p => p.text === submittedAnswer.text);
  expect(pollChoice.count).toBe(2);
  expect(pollChoice.letter).toBeNull();
});

test('Unupvote answer (FR)', () => {
  const upvotedAnswer = { text: 'POST' };
  // eslint-disable-next-line no-underscore-dangle
  groupSocket._upvoteAnswer(mockClient, googleID2, upvotedAnswer);

  const userAnswers = groupSocket.current.answers[googleID2];
  const userUpvotes = groupSocket.current.upvotes[googleID2];
  expect(userAnswers).toBeUndefined();
  expect(userUpvotes.length).toBe(0);

  const pollChoice = groupSocket.current.answerChoices.find(p => p.text === upvotedAnswer.text);
  expect(pollChoice.count).toBe(1);
});

test('Get current FR poll (admin/member)', () => {
  // eslint-disable-next-line no-underscore-dangle
  const currPollAdmin = groupSocket._currentPoll('admin');
  // eslint-disable-next-line no-underscore-dangle
  const currPoll = groupSocket._currentPoll('member');

  expect(currPollAdmin).toEqual(currPoll);

  expect(currPoll.answerChoices).toEqual(pollFR.answerChoices);
  expect(currPoll.correctAnswer).toBe(pollFR.correctAnswer);
  expect(currPoll.state).toBe(pollFR.state);
  expect(currPoll.text).toBe(pollFR.text);
  expect(currPoll.type).toBe(pollFR.type);
  expect(currPoll.userAnswers[googleID]).toEqual([{ text: 'POST' }]);
});

test('Explicit answer (FR)', () => {
  const badAnswer = { text: 'poop' };
  // eslint-disable-next-line no-underscore-dangle
  groupSocket._answerPoll(mockClient, googleID, badAnswer);

  const userAnswers = groupSocket.current.answers[googleID3];
  const userUpvotes = groupSocket.current.upvotes[googleID3];
  expect(userAnswers).toBeUndefined();
  expect(userUpvotes).toBeUndefined();

  const pollChoice = groupSocket.current.answerChoices.find(p => p.text === badAnswer.text);
  expect(pollChoice).toBeUndefined();
});

test('End poll (FR)', async () => {
  const socketPoll = groupSocket.current;
  // eslint-disable-next-line no-underscore-dangle
  await groupSocket._endPoll();

  expect(groupSocket.current).toBeNull();

  const polls = await GroupsRepo.getPolls(group.id);
  const createdPoll = polls[0];
  createdPollID = createdPoll.id;

  expect(createdPoll.text).toBe(pollFR.text);
  expect(createdPoll.type).toBe(pollFR.type);
  expect(createdPoll.correctAnswer).toBe(pollFR.correctAnswer);
  expect(createdPoll.state).toBe(constants.POLL_STATES.ENDED);
  expect(createdPoll.answerChoices).toEqual(pollFR.answerChoices);
  expect(createdPoll.answers).toEqual(socketPoll.answers);
  expect(createdPoll.upvotes).toEqual(socketPoll.upvotes);
});

test('Delete poll', async () => {
  // eslint-disable-next-line no-underscore-dangle
  await groupSocket._deletePoll(createdPollID);

  const polls = await GroupsRepo.getPolls(group.id);
  expect(polls.length).toBe(0);
});

// Teardown
afterAll(async () => {
  await GroupsRepo.deleteGroupByID(group.id);
  // eslint-disable-next-line no-console
  console.log('Passed all socket tests');
});
