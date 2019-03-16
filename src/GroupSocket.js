/* eslint-disable no-console */

// @flow
import SocketIO from 'socket.io';
import constants from './utils/Constants';
import Group from './models/Group';
import GroupsRepo from './repos/GroupsRepo';
import lib from './utils/Lib.js';
import PollsRepo from './repos/PollsRepo';
import UserSessionsRepo from './repos/UserSessionsRepo';

import type { PollState, PollType } from './utils/Constants';
import type { PollChoice, PollResult } from './models/Poll';

/** Configuration for each GroupSocket */
export type GroupSocketConfig = {
  group: Group,
  nsp: SocketIO.Namespace,
  onClose: void => void
}

type id = number;
type IOSocket = Object;

/** Poll object used in GroupSockets
 * @name SocketPoll
 */
type SocketPoll = {
  id?: id,
  answerChoices: PollResult[],
  correctAnswer: ?string,
  state: PollState,
  text: string,
  type: PollType,
  answers: {[string]: PollChoice[]}, // id = google id to [PollChoice] for MC and PollChoice[] for FR
  upvotes: {[string]: PollChoice[]} // id = google id to PollChoice[]
}

type ClientPoll = {
  id?: id,
  createdAt?: string,
  updatedAt?: string,
  answerChoices: PollResult[],
  correctAnswer: ?string,
  state: PollState,
  submittedAnswers: PollChoice[],
  text: string,
  type: PollType,
}

type PollFilter = {
  success: boolean,
  text?: string,
  filter?: String[]
}

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
  isLive = false

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

    const userType = await GroupsRepo.isAdmin(this.group.id, user) ? 'admin' : 'member';

    switch (userType) {
      case 'admin': {
        // console.log(`Admin with id ${client.id} connected to socket`);
        this._setupAdminEvents(client);
        client.join('admins');
        if (this.current) {
          client.emit('admin/poll/start', this._currentPoll(user.googleID, userType));
        }
        break;
      }
      case 'user': {
        // console.log(`User with id ${client.id} connected to socket`);
        this._setupUserEvents(client, user.googleID);
        client.join('users');
        if (this.current) {
          client.emit('user/poll/start', this._currentPoll(user.googleID, userType));
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
  }

  // ***************************** User Side ***************************
  // i.e. the server hears 'server/poll/respond
  /**
   * Sets up user events on the member side.
   * User Events:
   * 'server/poll/tally', (answerObject: Object) (Answer without id field)
   *  - Client answers current poll
   *  - Adds their answer to results and remove their old answer if exists
   *
   * 'server/poll/upvote', (answerObject: Object) (Answer without id field)
   *  - Client upvotes an answer or unupvotes if previously upvoted
   *  - Increases count of answer upvoted or decreases count of answer unupvoted
   * @function
   * @param {IOSocket} client - Client's socket object
   */
  _setupUserEvents(client: IOSocket, googleID: string): void {
    client.on('server/poll/answer', (userAnswer: PollChoice) => {
      const poll = this.current;
      if (!poll) {
        // console.log(`Client ${client.id} tried to answer with no active poll`);
        return;
      }

      switch (poll.type) {
        case constants.POLL_TYPES.MULTIPLE_CHOICE: // Multiple Choice
          if (poll.answers[googleID]) { // User selected something before
            poll.answerChoices.forEach((p: PollResult) => {
              if (p.letter && p.letter === poll.answers[googleID].letter) { p.count -= 1; }
            });
          }
          // update/add response
          poll.answers[googleID] = [userAnswer];
          poll.answerChoices.forEach((p: PollResult) => {
            if (p.letter && p.letter === userAnswer.letter) { p.count += 1; }
          });
          break;
        case constants.QUESTION_TYPES.FREE_RESPONSE: { // Free Response
          const badWords = lib.filterProfanity(userAnswer.text);
          if (badWords.length > 0) { // not clean text
            client.emit('user/poll/fr/filter',
              ({ success: false, text: userAnswer.text, filter: badWords }: PollFilter));
            return;
          }
          if (poll.answers[googleID]) { // User submitted another FR answer
            poll.answers[googleID].push(userAnswer);
            poll.upvotes[googleID].push(userAnswer);
          } else { // User submitted first FR answer
            poll.answers[googleID] = [userAnswer];
            poll.upvotes[googleID] = [userAnswer];
          }

          poll.answerChoices.push({ count: 1, letter: userAnswer.letter, text: userAnswer.text });
          client.emit('user/poll/fr/filter', ({ success: true }: PollFilter));
          break;
        }
        default:
          throw new Error('Unimplemented question type');
      }

      this.current = poll;

      this.nsp.to('admins').emit('admin/poll/updates', this.current);

      if (poll.type === constants.QUESTION_TYPES.FREE_RESPONSE) {
        // TODO
        this.nsp.to('users').emit('user/poll/fr/live', this.current);
      }
    });

    client.on('server/poll/upvote', (upvoteObject: PollChoice) => {
      const { text } = upvoteObject;
      const poll = this.current;
      if (!poll || !text) {
        // console.log(`Client with googleID ${googleID} tried to answer with no active poll`);
        return;
      }

      const currAnswer: ?PollResult = poll.answerChoices.find((p: PollResult) => p.text === text);
      if (currAnswer) {
        const userUpvotes = poll.upvotes[googleID];
        if (userUpvotes) {
          if (userUpvotes.find((p: PollChoice) => p.text === text)) { // unupvote
            currAnswer.count -= 1;
            poll.upvotes[googleID] = userUpvotes.filter(p => p.text !== text);
          } else { // upvote
            currAnswer.count += 1;
            poll.upvotes[googleID].push({ text });
          }
        } else { // init array and upvote
          currAnswer.count += 1;
          poll.upvotes[googleID] = [{ text }];
        }
      }

      this.current = poll;
      
      this.nsp.to('admins').emit('admin/poll/updates', this.current);
      if (poll.type === constants.QUESTION_TYPES.FREE_RESPONSE) {
        // TODO
        this.nsp.to('users').emit('user/poll/fr/live', this.current);
      }
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
   * @param {String} googleID
   * @return {?ClientPoll} Socket poll object
   */
  _currentPoll(googleID: string, userRole: string): ClientPoll | null {
    if (!this.current) return null; // no live poll
    const {
      answers, answerChoices, correctAnswer, state, text, type, upvotes,
    } = this.current;

    let submittedAnswers;
    const isFreeResponse = type === constants.POLL_TYPES.MULTIPLE_CHOICE;
    if (isFreeResponse) {
      submittedAnswers = answers[googleID];
    } else {
      submittedAnswers = upvotes[googleID];
    }
    if (!submittedAnswers) submittedAnswers = [];

    const filteredChoices = userRole === 'admin' || isFreeResponse ? answerChoices
      : answerChoices.map((a) => {
        a.count = null;
        return a;
      });

    return {
      answers,
      answerChoices: filteredChoices,
      correctAnswer,
      state,
      submittedAnswers,
      text,
      type,
      upvotes,
    };
  }

  /**
   * Starts poll on the socket
   * @param {SocketPoll} poll - Poll object to start
   */
  _startPoll(poll: Object) {
    // start new poll
    const newPoll: SocketPoll = {
      answerChoices: [],
      correctAnswer: poll.correctAnswer,
      state: constants.POLL_STATES.LIVE,
      text: poll.text,
      type: poll.type,
      answers: {},
      upvotes: {},
    };

    if (poll.options) {
      for (let i = 0; i < poll.options.length; i += 1) {
        const choice = String.fromCharCode(65 + i);
        const option = poll.options[i];
        newPoll.answerChoices.push({ count: 0, letter: choice, text: option });
      }
    }

    this.current = newPoll;
    this.isLive = true;

    this.nsp.to('users').emit('user/poll/start', { newPoll });
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
    const createdPoll = await PollsRepo.createPoll(poll.text, this.group,
      poll.answerChoices, poll.type, poll.correctAnswer, poll.answers, poll.state);
    poll.id = createdPoll.id;

    const adminPollNode: ClientPoll = {
      id: createdPoll.id,
      createdAt: createdPoll.createdAt,
      updatedAt: createdPoll.updatedAt,
      answerChoices: poll.answerChoices,
      correctAnswer: poll.correctAnswer,
      state: poll.state,
      submittedAnswers: [], // TODO
      text: poll.text,
      type: poll.type,
    };

    const filteredChoices = poll.answerChoices.map((a) => {
      a.count = null;
      return a;
    });

    const userPollNode: ClientPoll = poll.type === constants.POLL_TYPES.FREE_RESPONSE ? adminPollNode
      : { ...adminPollNode, answerChoices: filteredChoices };

    this.nsp.to('admins').emit('admin/poll/ended', { poll: adminPollNode });
    // TODO
    this.nsp.to('users').emit('user/poll/end', { poll: userPollNode });
  }

  /**
   * Deletes a poll that is already saved to database
   * @param {number} deleteID - Poll ID to delete
  */
  _deletePoll = async (deleteID: number) => {
    await PollsRepo.deletePollByID(deleteID);
    this.nsp.to('users').emit('user/poll/delete', deleteID);
  }

  /**
   * Deletes a live poll
   * @function
  */
  _deleteLivePoll = () => {
    this.current = null;
    this.nsp.to('users').emit('user/poll/delete/live');
  }

  /**
   * Setups up events for users on admin side
   * Admin events:
   * 'server/poll/start' (pollObject: Object) (Poll object without id field)
   * - Admin wants to start a poll
   * - Creates cache to store answers
   * - Notifies clients new poll has started
   *
   * 'server/poll/end' (void)
   * - Admin wants to close a poll
   * - Persists recieved polls
   * - Notifies clients quesiton is now closed
   *
   * 'server/poll/results' (void)
   * - Shares poll results with members
   */
  _setupAdminEvents(client: Object): void {
    const { address } = client.handshake;

    if (!address) {
      this._clientError(client, 'No client address');
      return;
    }

    // Start poll
    client.on('server/poll/start', async (pollObject: Object) => {
      // console.log('starting', poll);
      if (this.current && this.current.state === constants.POLL_STATES.LIVE) {
        await this._endPoll();
      }
      this._startPoll(pollObject);
    });

    // share results
    client.on('server/poll/results', async () => {
      // console.log('sharing results');
      // Update poll to 'shared'
      if (this.current && this.current.id) {
        await PollsRepo.updatePollByID(this.current.id, null,
          null, null, constants.POLL_STATES.SHARED);
      }

      this.current = null;
      this.nsp.to('users').emit('user/poll/results', this.current);
    });

    // End poll
    client.on('server/poll/end', async () => {
      // console.log('ending poll');
      await this._endPoll();
    });

    // Delete saved poll
    client.on('server/poll/delete', async (deleteID: number) => {
      // console.log('deleting saved poll');
      await this._deletePoll(deleteID);
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
