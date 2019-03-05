/* eslint-disable no-console */

// @flow
import SocketIO from 'socket.io';
import Group from './models/Group';
import PollsRepo from './repos/PollsRepo';
import GroupsRepo from './repos/GroupsRepo';
import constants from './utils/Constants';

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
type Poll = {
  id: number,
  text: string,
  type: string,
  options: ?string[],
  shared: boolean,
  correctAnswer: string,
}

/** Answer object used in GroupSockets */
type Answer = {
  id: id,
  googleID: string,
  poll: id,
  choice: string,
  text: string
}

/** Keeps track of current state of a Group Socket
 * @example
 * let currentState = {
 *   poll: 1,
 *   results: {'A': {'text': 'blue', 'count': 2}},
 *   answers: {'1': 'A', '2': 'A'}
 * }
 */
type CurrentState = {
  poll: number,
  results: {}, // MC: {'A': {'text': 'blue', 'count': 1}}, FR: {1: {'text': 'blue', 'count': 1}}
  answers: {}, // id = google id to answer choice for MC and array of answer ids for FR
  upvotes: {} // id = google id to array of answer ids
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

  closing: boolean = false;

  /**
   * Stores all polls/answers for the group.
   */
  polls: {
    [string]: {
      poll: Poll,
      answers: {
        [string]: Answer
      }
    }
  }

  // Counter for generating poll/answer ids
  pollID: number;

  answerID: number;

  // Number of users connected
  usersConnected: number;

  // Previous poll
  lastPoll = null;

  // Previous state
  lastState = {};

  // Google ids of admin/user to add to the group
  // List of users saved to group when a user exits socket (same for admins)
  adminGoogleIDs = [];

  userGoogleIDs = [];

  /** Current state of the socket */
  current: CurrentState = {
      poll: -1, // id of current poll object
      results: {},
      answers: {},
      upvotes: {},
  }

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

      this.polls = {};
      this.pollID = 0;
      this.answerID = 0;
      this.usersConnected = 0;
  }

  // v1 message
  saveGroup() {
      // console.log('save this grouping group on user side');
      this.nsp.to('users').emit('user/poll/save', this.group);
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
      const userType: ?string = client.handshake.query.userType || null;
      const googleID: ?string = client.handshake.query.googleID || null;

      switch (userType) {
          case 'admin': {
              // console.log(`Admin with id ${client.id} connected to socket`);
              if (googleID) {
                  this.adminGoogleIDs.push(googleID);
              }
              this._setupAdminEvents(client);
              client.join('admins');
              this.nsp.to('admins').emit('user/count', { count: this.usersConnected });

              const currentPoll = this._currentPoll();
              if (currentPoll) {
                  client.emit('admin/poll/start', { poll: currentPoll });
                  client.emit('admin/poll/updateTally/live', this.current);
              }
              break;
          }
          case 'member':
          case 'user': {
              // console.log(`User with id ${client.id} connected to socket`);
              if (googleID) {
                  this.userGoogleIDs.push(googleID);
              }
              this._setupUserEvents(client);
              client.join('users');

              this.usersConnected += 1;
              this.nsp.to('users').emit('user/count', { count: this.usersConnected });
              this.nsp.to('admins').emit('user/count', { count: this.usersConnected });

              const currentPoll = this._currentPoll();
              if (currentPoll) {
                  client.emit('user/poll/start', { poll: currentPoll });
                  client.emit('user/question/start', { question: currentPoll }); //     v1
                  client.emit('user/poll/results/live', this.current);
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
  _setupUserEvents(client: IOSocket): void {
      client.on('server/poll/tally', (answerObject: Object) => {
          const answer: Answer = {
              id: this.answerID,
              googleID: answerObject.googleID,
              poll: answerObject.poll,
              choice: answerObject.choice,
              text: answerObject.text,
          };
          this.answerID += 1;
          const poll = this._currentPoll();
          if (poll === null || poll === undefined) {
              // console.log(`Client ${client.id} tried to answer with no active poll`);
              return;
          }
          if (poll.id !== answer.poll) {
              // console.log(`Poll ${answer.poll} is not the current poll`);
              return;
          }

          const nextState = { ...this.current };
          const prev = nextState.answers[answer.googleID];

          if (poll.type === constants.QUESTION_TYPES.MULTIPLE_CHOICE) {
              nextState.answers[answer.googleID] = answer.choice; // update/add response
              if (prev) { // User selected something before
                  nextState.results[prev].count -= 1;
              }
          } else if (prev) { // User submitted another FR answer
              nextState.answers[answer.googleID].push(answer.id);
          } else { // User submitted first FR answer
              nextState.answers[answer.googleID] = [answer.id];
          }

          const key = poll.type === constants.QUESTION_TYPES.MULTIPLE_CHOICE
              ? answer.choice : answer.id;

          if (nextState.results[key]) { // if answer already in results
              nextState.results[key].count += 1;
          } else {
              nextState.results[key] = { text: answer.text, count: 1 };
          }

          this.current = nextState;
          this.nsp.to('admins').emit('admin/poll/updateTally', this.current);
          if (poll.shared || poll.type === constants.QUESTION_TYPES.FREE_RESPONSE) {
              this.nsp.to('users').emit('user/poll/results', this.current);
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
                      nextState.upvotes[googleID].filter(a => a !== answerID);
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

      // v1
      client.on('server/question/tally', (answerObject: Object) => {
          const answer: Answer = {
              id: this.answerID,
              googleID: answerObject.deviceID,
              poll: answerObject.question,
              choice: answerObject.choice,
              text: answerObject.text,
          };
          this.answerID += 1;
          const question = this._currentPoll();
          if (question === null || question === undefined) {
              // console.log(`Client ${client.id} answered on no question`);
              return;
          }
          if (question.id !== answer.poll) {
              // console.log(`Poll ${answer.poll} is not the current poll`);
              return;
          }

          const nextState = { ...this.current };
          const prev = nextState.answers[answer.googleID];
          // update/input user's response
          nextState.answers[answer.googleID] = answer.choice;
          if (prev) { // if truthy
              // has selected something before
              nextState.results[prev].count -= 1;
              const poll = this._currentPoll();
              if (poll && poll.type === constants.QUESTION_TYPES.FREE_RESPONSE) {
                  if (nextState.results[prev].count <= 0) {
                      delete nextState.results[prev];
                  }
              }
          }

          const curTally = nextState.results[answer.choice];
          if (curTally) { // if truthy
              nextState.results[answer.choice].count += 1;
          } else {
              nextState.results[answer.choice] = { text: answer.text, count: 1 };
          }

          this.current = nextState;
          this.nsp.to('admins').emit('admin/question/updateTally', {
              answers: nextState.answers,
              results: nextState.results,
              question: nextState.poll,
          });
      });

      client.on('disconnect', async () => {
          // console.log(`User ${client.id} disconnected.`);
          await GroupsRepo.addUsersByGoogleIDs(this.group.id,
              this.userGoogleIDs, 'user');
          this.userGoogleIDs = [];

          if (this.nsp.connected.length === 0) {
              await this._endPoll();
              this.onClose();
          }
          this.usersConnected -= 1;
          this.nsp.to('users').emit('user/count', { count: this.usersConnected });
          this.nsp.to('admins').emit('user/count', { count: this.usersConnected });
      });
  }

  // *************************** Admin Side ***************************

  /**
   * Gives current poll
   * @function
   * @return {?SocketPoll} Socket poll object
   */
  _currentPoll(): Poll | null {
      if (this.current.poll === -1) {
          return null;
      }
      return this.polls[`${this.current.poll}`].poll;
  }

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
              results[String.fromCharCode(65 + i)] = { text: poll.options[i], count: 0 };
          }
      }
      this.current.results = results;
      this.current.answers = {};
      this.current.upvotes = {};
      this.isLive = true;

      this.nsp.to('users').emit('user/poll/start', { poll });
      this.nsp.to('users').emit('user/question/start', { question: poll }); // v1
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
      this.nsp.to('users').emit('user/question/end', { question: poll }); // v1
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

      // v1
      client.on('server/question/start', async (questionObject: Object) => {
          const question: Poll = {
              id: this.pollID,
              text: questionObject.text,
              type: questionObject.type,
              options: questionObject.options,
              shared: false,
              correctAnswer: questionObject.correctAnswer,
          };
          this.pollID += 1;
          // console.log('starting', question);
          if (this.current.poll !== -1) {
              await this._endPoll();
          }
          this._startPoll(question);
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

      // v1
      client.on('server/question/results', async () => {
          // console.log('sharing results');
          if (this.lastPoll) {
              await PollsRepo.updatePollByID(this.lastPoll.id, null,
                  null, true);
          }
          const current = this.lastState;
          this.nsp.to('users').emit('user/question/results', {
              answers: current.answers,
              results: current.results,
              question: current.poll,
          });
      });

      // End poll
      client.on('server/poll/end', async () => {
          // console.log('ending poll');
          await this._endPoll();
      });

      // v1
      client.on('server/question/end', async () => {
          // console.log('ending question');
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
          await GroupsRepo.addUsersByGoogleIDs(this.group.id,
              this.adminGoogleIDs, 'admin');
          this.adminGoogleIDs = [];

          if (this.current.poll === -1) this.isLive = false;

          if (this.nsp.connected.length === 0) {
              await this._endPoll();
              this.onClose();
          }
      });
  }
}
