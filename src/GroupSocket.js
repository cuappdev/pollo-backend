/* eslint-disable no-console */

// @flow
import SocketIO from 'socket.io';
import constants from './utils/Constants';
import Group from './models/Group';
import GroupsRepo from './repos/GroupsRepo';
import PollsRepo from './repos/PollsRepo';
import UserSessionsRepo from './repos/UserSessionsRepo';

import type { PollChoice, PollResult } from './models/Poll';
import type { PollState } from './utils/Constants';

/** Configuration for each GroupSocket */
export type GroupSocketConfig = {
  group: Group,
  nsp: SocketIO.Namespace,
  onClose: void => void
};

type id = string;
type IOSocket = Object;

/** Poll object used in GroupSockets
 * @name SocketPoll
 */
type SocketPoll = {
  id?: id,
  createdAt?: string,
  updatedAt?: string,
  answers: { string: PollChoice[] }, // {googleID: [PollChoice]}
  answerChoices: PollResult[],
  correctAnswer: ?string, // letter of PollChoice
  state: PollState,
  text: string,
};

type ClientPoll = {
  id?: id,
  answerChoices: PollResult[], // count is null if user is 'member' and poll is live
  correctAnswer?: string,
  createdAt?: string,
  state: PollState,
  text: string,
  updatedAt?: string,
  userAnswers: { string: PollChoice[] } // {googleID: PollChoice[]} of answers
};

/**
 * Represents a single running group
 * @param {GroupSocketConfig} config - Configuration for group socket
 * @param {Group} config.group - Group to make active
 * @param {SocketIO.Namespace} config.nsp - Socket Namespace
 * @param {function} config.onClose - Function called when socket closes
 */
export default class GroupSocket {
  /** Group that is running */
  group: Group;

  /** Namespace of socket */
  nsp: SocketIO.Namespace;

  onClose: void => void;

  /** Current poll */
  current: ?SocketPoll;

  closing: boolean = false;

  /**
   * Indicate whether group is live or not
   * Becomes live when a poll is started
   * Becomes inactive when no admin is connected to socket && no live poll
   */
  isLive = false;

  constructor({ group, nsp, onClose }: GroupSocketConfig) {
    this.group = group;
    this.nsp = nsp;
    this.nsp.on('connect', this._onConnect.bind(this));
    this.onClose = onClose;
  }

  _clientError(client: IOSocket, msg: string): void {
    // console.log(msg);
  }

  /**
   * Handles response and setup when a user connects
   * @function
   * @param {IOSocket} client - The client object upon connection
   */
  _onConnect = async (client: IOSocket) => {
    const user = await UserSessionsRepo.getUserFromToken(client.handshake.query.accessToken);
    if (!user) {
      this._clientError(client, 'Invalid accessToken: user does not exist');
      return;
    }

    const userType = (await GroupsRepo.isAdmin(this.group.uuid, user)) ? 'admin' : 'member';

    switch (userType) {
      case 'admin': {
        // console.log(`Admin with id ${client.id} connected to socket`);
        this._setupAdminEvents(client);
        client.join('admins');
        if (this.current) {
          client.emit('admin/poll/start', this._currentPoll(constants.USER_TYPES.ADMIN));
        }
        break;
      }
      case 'member': {
        // console.log(`User with id ${client.id} connected to socket`);
        this._setupUserEvents(client, user.googleID);
        client.join('members');
        if (this.current) {
          client.emit('user/poll/start', this._currentPoll(constants.USER_TYPES.MEMBER));
        }
        break;
      }
      default: {
        if (!userType) {
          this._clientError(client, 'Invalid user connected: no userType');
        } else {
          this._clientError(client, `Invalid userType ${userType} connected`);
        }
      }
    }
  };

  _answerPoll(client: IOSocket, googleID: string, submittedAnswer: PollChoice): void {
    const poll = this.current;
    if (!poll) {
      // console.log(`Client ${client.id} tried to answer with no active poll`);
      return;
    }

    if (poll.answers[googleID]) { // User selected something before
      poll.answerChoices.forEach((p: PollResult) => {
        if (p.letter && (p.count !== null) && p.letter === poll.answers[googleID][0].letter) {
          p.count -= 1;
        }
      });
    }
    // update/add response
    poll.answers[googleID] = [submittedAnswer];
    poll.answerChoices.forEach((p: PollResult) => {
      if (p.letter && (p.count !== null) && p.letter === submittedAnswer.letter) {
        p.count += 1;
      }
    });

    this.current = poll;

    this.nsp.to('admins').emit('admin/poll/updates', this._currentPoll(constants.USER_TYPES.ADMIN));
  }

  // ***************************** User Side ***************************
  // i.e. the server hears 'server/poll/respond
  /**
   * Sets up user events on the member side.
   * User Events:
   * 'server/poll/answer' (PollChoice)
   *  - Client answers current poll
   *  - Adds the answer to answers
   *
   * @function
   * @param {IOSocket} client - Client's socket object
   * @param {String} googleID
   */
  _setupUserEvents(client: IOSocket, googleID: string): void {
    client.on('server/poll/answer', (submittedAnswer: PollChoice) => {
      this._answerPoll(client, googleID, submittedAnswer);
    });

    client.on('disconnect', async () => {
      // console.log(`User ${client.id} disconnected.`);
      if (this.nsp.connected.length === 0) {
        await this._endPoll();
        this.onClose();
      }
    });
  }

  // *************************** Admin Side ***************************

  /**
  * Gives current poll
  * @param {String} userRole
  * @return {?ClientPoll} Socket poll object
  */
  _currentPoll(userRole: string): ClientPoll | null {
    if (!this.current) return null; // no live poll

    let { correctAnswer, answers } = this.current;
    const {
      createdAt, updatedAt, answerChoices, state, text,
    } = this.current;
    const pollID = this.current.id;

    if (!answers) answers = {};
    if (!correctAnswer) correctAnswer = '';

    const filteredChoices = userRole === constants.USER_TYPES.ADMIN
    || state !== constants.POLL_STATES.LIVE
      ? answerChoices
      : answerChoices.map(a => ({ ...a, count: null }));

    return {
      id: pollID,
      createdAt,
      updatedAt,
      answerChoices: filteredChoices,
      correctAnswer,
      state,
      text,
      userAnswers: answers,
    };
  }

  /**
  * Starts poll on the socket
  * @param {ClientPoll} poll - Poll object to start
  */
  _startPoll(poll: ClientPoll) {
  // start new poll
    const newPoll: SocketPoll = {
      createdAt: String(Math.floor(new Date().getTime() / 1000)),
      answerChoices: poll.answerChoices,
      correctAnswer: poll.correctAnswer,
      state: constants.POLL_STATES.LIVE,
      text: poll.text,
      answers: {},
    };

    this.current = newPoll;
    this.isLive = true;

    this.nsp.to('members').emit('user/poll/start', this._currentPoll(constants.USER_TYPES.MEMBER));
  }

/**
 * Ends current poll
 * @function
 */
_endPoll = async () => {
  const poll = this.current;
  if (!poll) {
    return;
  }
  poll.state = constants.POLL_STATES.ENDED;
  const createdPoll = await PollsRepo.createPoll(
    poll.text,
    this.group,
    poll.answerChoices,
    poll.correctAnswer,
    poll.answers,
    poll.state,
  );
  this.current = { ...createdPoll };

  this.nsp.to('admins').emit('admin/poll/ended', this._currentPoll(constants.USER_TYPES.ADMIN));
  this.nsp.to('members').emit('user/poll/end', this._currentPoll(constants.USER_TYPES.MEMBER));

  this.current = null;
};

/**
 * Deletes a poll that is already saved to database
 * @param {id} pollID - Poll UUID to delete
 */
_deletePoll = async (pollID: id) => {
  await PollsRepo.deletePollByID(pollID);
  this.nsp.to('members').emit('user/poll/delete', pollID);
};

/**
 * Deletes a live poll
 * @function
 */
_deleteLivePoll = () => {
  this.current = null;
  this.nsp.to('members').emit('user/poll/delete/live');
};

/**
 * Setups up events for users on admin side
 * Admin events:
 * 'server/poll/start' (ClientPoll) (no id and updatedAt)
 * - Admin wants to start a poll
 * - Notifies members new poll has started
 *
 * 'server/poll/end' (void)
 * - Admin wants to close a poll
 * - Persists recieved polls
 * - Notifies members and admins that poll is now closed
 *
 * 'server/poll/results' (pollID)
 * - Shares poll results with members
 * - Notifies members with shared poll
 *
 * 'server/poll/delete' (pollID)
 * - Delete saved poll
 * - Notifies members that poll with pollID is deleted
 *
 * 'server/poll/delete/live' (void)
 * - Delete current poll
 * - Notifies members that live poll is deleted
 * @function
 * @param {IOSocket} client - Client's socket object
 */
_setupAdminEvents(client: IOSocket): void {
  const { address } = client.handshake;

  if (!address) {
    this._clientError(client, 'No client address');
    return;
  }

  // Start poll
  client.on('server/poll/start', async (pollObject: ClientPoll) => {
    // console.log('starting', poll);
    if (this.current && this.current.state === constants.POLL_STATES.LIVE) {
      await this._endPoll();
    }
    this._startPoll(pollObject);
  });

  // share results
  client.on('server/poll/results', async (pollID: id) => {
    // console.log('sharing results');
    // Update poll to 'shared'
    const sharedPoll = await PollsRepo.updatePollByID(
      pollID, null, null, null, constants.POLL_STATES.SHARED,
    );

    if (!sharedPoll) {
      this._clientError(client, 'Cannot find poll to update.');
      return;
    }

    const {
      createdAt, updatedAt, answers, answerChoices, correctAnswer, state, text,
    } = sharedPoll;

    let userAnswers = answers;
    if (!userAnswers) userAnswers = {};

    this.nsp.to('members').emit('user/poll/results', ({
      id: pollID, createdAt, updatedAt, answerChoices, correctAnswer, state, text, userAnswers,
    } : ClientPoll));
  });

  // End poll
  client.on('server/poll/end', async () => {
    // console.log('ending poll');
    await this._endPoll();
  });

  // Delete saved poll
  client.on('server/poll/delete', async (pollID: id) => {
    // console.log('deleting saved poll');
    await this._deletePoll(pollID);
  });

  // Delete live poll
  client.on('server/poll/delete/live', async () => {
    // console.log('deleting live poll');
    await this._deleteLivePoll();
  });

  client.on('disconnect', async () => {
    // console.log(`Admin ${client.id} disconnected.`);
    if (this.current === null) this.isLive = false;

    if (this.nsp.connected.length === 0) {
      await this._endPoll();
      this.onClose();
    }
  });
}
}
