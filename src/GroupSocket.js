/* eslint-disable no-console */

// @flow
import SocketIO from 'socket.io';
import constants from './utils/Constants';
import Group from './models/Group';
import lib from './utils/Lib.js';
import PollsRepo from './repos/PollsRepo';
import UserSessionsRepo from './repos/UserSessionsRepo'

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
  text: string,
  answerChoices: [PollResult], //CHANGE
  type: enum, //CHANGE
  correctAnswer: string?,
  answers: {}, // id = google id to PollChoice for MC and array of PollChoice for FR
  upvotes: {} // id = google id to array of PollChoice
}

type ClientPoll = {
  createdAt: ?string,
  updatedAt: ?string,
  id: ?id,
  text: string,
  answerChoices: [PollResult], //CHANGE
  type: enum, //CHANGE
  correctAnswer: string?,
  submittedAnswers: [PollChoice], //CHANGE
  state: enum //CHANGE
}

type PollFilter = {
  success: boolean,
  text: ?string,
  filter: ?[string]
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

  /** Current poll*/
  current: SocketPoll = null;

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
  _onConnect = async (client: IOSocket, accessToken: string) => {
    const userType: ?string = client.handshake.query.userType || null;
    const googleID = UserSessionsRepo.getUserFromToken(accessToken)
                                     .then(user => user.googleID)

    switch (userType) {
      case 'admin': {
        // console.log(`Admin with id ${client.id} connected to socket`);
        this._setupAdminEvents(client, accessToken);
        client.join('admins');
        if (currentPoll) {
          client.emit('admin/poll/start', this._currentPoll(googleID));
        }
        break;
      }
      case 'user': {
        // console.log(`User with id ${client.id} connected to socket`);
        this._setupUserEvents(client, accessToken);
        client.join('users');
        if (currentPoll) {
          client.emit('user/poll/start', this._currentPoll(googleID));
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
      const poll = this._currentPoll(accessToken);
      if (!poll) {
        // console.log(`Client ${client.id} tried to answer with no active poll`);
        return;
      }

      switch (poll.type) {
        case constants.QUESTION_TYPES.MULTIPLE_CHOICE: // Multiple Choice
          if (answers.googleID) { // User selected something before
            poll.answerChoices = poll.answerChoices.map(p => {
                if (p.letter === answers.googleID[0].letter) {p.count -= 1}
              })
          }
          // update/add response
          answers.googleID = [userAnswer]
          poll.answerChoices = poll.answerChoices.map(p => {
              if (p.letter === userAnswer.letter) {p.count += 1}
            })
          break;
        case constants.QUESTION_TYPES.FREE_RESPONSE: { // Free Response
          const badWords = lib.filterProfanity(userAnswer.option);
          if (badWords.length > 0) { // not clean text
            client.emit('user/poll/fr/filter',
              { success: false, text: answer.text, filter: badWords });
            return;
          }
          if (answers.googleID) { // User submitted another FR answer
            poll.answers.googleID.push(userAnswer);
            poll.upvotes.googleID.push(userAnswer);
          } else { // User submitted first FR answer
            poll.answers.googleID = userAnswer;
            poll.upvotes.googleID = userAnswer;
          }
          poll.answerChoices.push({ ...userAnswer, count: 1 })
          client.emit('user/poll/fr/filter', { success: true });
          break;
        }
        default:
          throw new Error('Unimplemented question type');
      }

      this.current = poll;
      this.nsp.to('admins').emit('admin/poll/updates', this._currentPoll(googleID));
      if (poll.type === constants.QUESTION_TYPES.FREE_RESPONSE) {
        this.nsp.to('users').emit('user/poll/results', this._currentPoll(googleID));
      }
    });

    client.on('server/poll/upvote', (upvoteObject: Object) => {
      const { answerID, googleID } = upvoteObject;
      const poll = this._currentPoll();
      if (poll === null || poll === undefined) {
        // console.log(`Client with googleID ${googleID} tried to answer with no active poll`);
        return;
      }
      const nextState = { ...this.current };
      const curTally = nextState.results[answerID];
      if (curTally) {
        if (nextState.upvotes[googleID]) {
          if (nextState.upvotes[googleID].includes(answerID)) { // unupvote
            nextState.results[answerID].count -= 1;
            nextState.upvotes[googleID] = nextState.upvotes[googleID].filter(a => a !== answerID);
          } else { // upvote
            nextState.results[answerID].count += 1;
            nextState.upvotes[googleID].push(answerID);
          }
        } else { // init array and upvote
          nextState.results[answerID].count += 1;
          nextState.upvotes[googleID] = [answerID];
        }
      }
      this.current = nextState;
      this.nsp.to('admins').emit('admin/poll/updateTally', this.current);
      if (poll.shared || poll.type === constants.QUESTION_TYPES.FREE_RESPONSE) {
        this.nsp.to('users').emit('user/poll/results', this.current);
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
   * @param {String} accessToken
   * @return {?ClientPoll} Socket poll object
   */
  _currentPoll(googleID: string): ClientPoll | null {
    if (!this.current) return null // no live poll
    const { text, answerChoices, type, correctAnswer, answers, upvotes } = this.current
    const state = constants.LIVE //change
    let submittedAnswers;
    if (type = constants.multipleChoice) { //change
      submittedAnswers = answers[googleID]
    } else {
      submittedAnswers = upvotes[googleID]
    }
    if (!submittedAnswers) submittedAnswers = []
    return { text, answerChoices, type, correctAnswer, submittedAnswers, state}

  /**
   * Starts poll on the socket
   * @param {SocketPoll} poll - Poll object to start
   */
  _startPoll(poll: Poll) {
    // start new poll
    this.current.poll = poll.id;
    if (this.polls[`${poll.id}`] !== null
      || this.polls[`${poll.id}`] !== undefined) {
      this.polls[`${poll.id}`] = {
        poll,
        answers: {},
      };
    }
    const results = {};
    if (poll.options) {
      for (let i = 0; i < poll.options.length; i += 1) {
        const choice = String.fromCharCode(65 + i);
        const option = poll.options[i];
        results[choice] = { text: option, count: 0 };
        poll.optionsWithChoices.push({ choice, option });
      }
    }
    this.current.results = results;
    this.current.answers = {};
    this.current.upvotes = {};
    this.isLive = true;

    this.nsp.to('users').emit('user/poll/start', { poll });
  }

  /**
   * Ends current poll
   * @function
   */
  _endPoll = async () => {
    const poll = this._currentPoll();
    if (!poll) {
      return;
    }
    this.lastPoll = await PollsRepo.createPoll(poll.text, this.group,
      this.current.results, poll.shared, poll.type, poll.correctAnswer,
      this.current.answers);
    this.lastState = this.current;
    const pollNode = {
      id: this.lastPoll.id,
      text: poll.text,
      type: poll.type,
      options: poll.options,
      shared: poll.shared,
      correctAnswer: poll.correctAnswer,
    };
    this.nsp.to('admins').emit('admin/poll/ended', { poll: pollNode });
    this.nsp.to('users').emit('user/poll/end', { poll: pollNode });
    this.current.poll = -1;
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
    this.current.poll = -1;
    this.nsp.to('users').emit('user/poll/deleteLive');
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
      const poll: Poll = {
        id: this.pollID,
        text: pollObject.text,
        type: pollObject.type,
        options: pollObject.options,
        optionsWithChoices: [],
        shared: pollObject.shared,
        correctAnswer: pollObject.correctAnswer,
      };
      this.pollID += 1;
      // console.log('starting', poll);
      if (this.current.poll !== -1) {
        await this._endPoll();
      }
      this._startPoll(poll);
    });

    // share results
    client.on('server/poll/results', async () => {
      // console.log('sharing results');
      // Update poll to 'shared'
      if (this.lastPoll) {
        await PollsRepo.updatePollByID(this.lastPoll.id, null,
          null, true);
      }
      const current = this.lastState;
      this.nsp.to('users').emit('user/poll/results', current);
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
    client.on('server/poll/deleteLive', async () => {
      // console.log('deleting live poll');
      await this._deleteLivePoll();
    });

    client.on('disconnect', async () => {
      // console.log(`Admin ${client.id} disconnected.`);
      if (this.current.poll === -1) this.isLive = false;

      if (this.nsp.connected.length === 0) {
        await this._endPoll();
        this.onClose();
      }
    });
  }
}
