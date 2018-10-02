// @flow
import SocketIO from 'socket.io';
import Session from './models/Session';
import PollsRepo from './repos/PollsRepo';
import SessionsRepo from './repos/SessionsRepo';
import constants from './utils/constants';

/** Configuration for each SessionSocket */
export type SessionSocketConfig = {
  session: Session,
  nsp: SocketIO.Namespace,
  onClose: void => void
}

type id = number;
type IOSocket = Object;

/** Poll object used in SessionSockets
 * @name SocketPoll
 */
type Poll = {
  id: number,
  text: string,
  type: string,
  options: ?string[],
  shared: boolean
}

/** Answer object used in SessionSockets */
type Answer = {
  id: id,
  googleId: string,
  poll: id,
  choice: string,
  text: string
}

/** Keeps track of current state of a Session Socket
 * @example
 * let currentState = {
 *   poll: 1,
 *   results: {'A': {'text': 'blue', 'count': 2}},
 *   answers: {'1': 'A', '2': 'A'}
 * }
 */
type CurrentState = {
  poll: number,
  results: {}, // {'A': {'text': 'blue', 'count': 1}}
  answers: {} // id = client id, answer = current choice
}

/**
 * Represents a single running session
 * @param {SessionSocketConfig} config - Configuration for session socket
 * @param {Session} config.session - Session to make active
 * @param {SocketIO.Namespace} config.nsp - Socket Namespace
 * @param {function} config.onClose - Function called when socket closes
 */
export default class SessionSocket {
  /** Session that is running */
  session: Session;

  /** Namespace of socket */
  nsp: SocketIO.Namespace;

  onClose: void => void;

  closing: boolean = false;

  /**
   * Stores all polls/answers for the session.
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
  pollId: number;

  answerId: number;

  // Number of users connected
  usersConnected: number;

  // Previous poll
  lastPoll = null;

  // Previous state
  lastState = {};

  // Google ids of admin/user to add to the session
  // List of users saved to session when a user exits socket (same for admins)
  adminGoogleIds = [];

  userGoogleIds = [];

  /** Current state of the socket */
  current: CurrentState = {
      poll: -1, // id of current poll object
      results: {},
      answers: {},
  }

  constructor({ session, nsp, onClose }: SessionSocketConfig) {
      this.session = session;
      this.nsp = nsp;
      this.nsp.on('connect', this._onConnect.bind(this));
      this.onClose = onClose;

      this.polls = {};
      this.pollId = 0;
      this.answerId = 0;
      this.usersConnected = 0;
  }

  // v1 message
  saveSession() {
      console.log('save this sessioning session on user side');
      this.nsp.to('users').emit('user/poll/save', this.session);
  }

  _clientError(client: IOSocket, msg: string): void {
      console.log(msg);
  }

  /**
   * Handles response and setup when a user connects
   * @function
   * @param {IOSocket} client - The client object upon connection
   */
  _onConnect = async (client: IOSocket) => {
      const userType: ?string = client.handshake.query.userType || null;
      const googleId: ?string = client.handshake.query.googleId || null;

      switch (userType) {
          case 'admin': {
              console.log(`Admin with id ${client.id} connected to socket`);
              if (googleId) {
                  this.adminGoogleIds.push(googleId);
              }
              this._setupAdminEvents(client);
              client.join('admins');
              client.emit('user/count', { count: this.usersConnected });

              const currentPoll = this._currentPoll();
              if (currentPoll) {
                  client.emit('admin/poll/start', { poll: currentPoll });
              }
              break;
          }
          case 'member':
          case 'user': {
              console.log(`User with id ${client.id} connected to socket`);
              if (googleId) {
                  this.userGoogleIds.push(googleId);
              }
              this._setupUserEvents(client);
              client.join('users');

              this.usersConnected += 1;
              this.nsp.to('users').emit('user/count', { count: this.usersConnected });
              this.nsp.to('admins').emit('user/count', { count: this.usersConnected });

              const currentPoll = this._currentPoll();
              if (currentPoll) {
                  client.emit('user/poll/start', { poll: currentPoll });
                  client.emit('user/question/start', { question: currentPoll }); // v1
              }
              break;
          }
          default: {
              if (!userType) {
                  this._clientError(client, 'Invalid user connected: no userType.');
              } else {
                  this._clientError(client, `Invalid userType ${userType} connected.`);
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
   *  - Client upvotes an answer
   *  - Increases count of answer upvoted
   * @function
   * @param {IOSocket} client - Client's socket object
   */
  _setupUserEvents(client: IOSocket): void {
      client.on('server/poll/tally', (answerObject: Object) => {
          const answer: Answer = {
              id: this.answerId,
              googleId: answerObject.googleId,
              poll: answerObject.poll,
              choice: answerObject.choice,
              text: answerObject.text,
          };
          this.answerId += 1;
          const poll = this._currentPoll();
          if (poll === null || poll === undefined) {
              console.log(`Client ${client.id} tried to answer with no active poll`);
              return;
          }
          if (poll.id !== answer.poll) {
              console.log(`Poll ${answer.poll} is not the current poll`);
              return;
          }

          const nextState = { ...this.current };
          const prev = nextState.answers[answer.googleId];
          nextState.answers[answer.googleId] = answer.choice; // update/add response
          if (prev) { // if truthy
              // has selected something before
              nextState.results[prev].count -= 1;
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
          this.nsp.to('admins').emit('admin/poll/updateTally', this.current);
          if (poll.shared) {
              this.nsp.to('users').emit('user/poll/results', this.current);
          }
      });

      client.on('server/poll/upvote', (answerObject: Object) => {
          const answer: Answer = {
              id: this.answerId,
              googleId: answerObject.googleId,
              poll: answerObject.poll,
              choice: answerObject.choice,
              text: answerObject.text,
          };
          this.answerId += 1;
          const poll = this._currentPoll();
          if (poll === null || poll === undefined) {
              console.log(`Client ${client.id} tried to answer with no active poll`);
              return;
          }
          if (poll.id !== answer.poll) {
              console.log(`Poll ${answer.poll} is not the current poll`);
              return;
          }

          const nextState = { ...this.current };
          const curTally = nextState.results[answer.choice];
          if (curTally) {
              nextState.results[answer.choice].count += 1;
          } else {
              nextState.results[answer.choice] = { text: answer.text, count: 1 };
          }

          this.current = nextState;
          this.nsp.to('admins').emit('admin/poll/updateTally', this.current);
          if (poll.shared) {
              this.nsp.to('users').emit('user/poll/results', this.current);
          }
      });

      // v1
      client.on('server/question/tally', (answerObject: Object) => {
          const answer: Answer = {
              id: this.answerId,
              googleId: answerObject.deviceId,
              poll: answerObject.question,
              choice: answerObject.choice,
              text: answerObject.text,
          };
          this.answerId += 1;
          const question = this._currentPoll();
          if (question === null || question === undefined) {
              console.log(`Client ${client.id} answered on no question`);
              return;
          }
          if (question.id !== answer.poll) {
              console.log(`Poll ${answer.poll} is not the current poll`);
              return;
          }

          const nextState = { ...this.current };
          const prev = nextState.answers[answer.googleId];
          // update/input user's response
          nextState.answers[answer.googleId] = answer.choice;
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
          console.log(`User ${client.id} disconnected.`);
          await SessionsRepo.addUsersByGoogleIds(this.session.id,
              this.userGoogleIds, 'user');
          this.userGoogleIds = [];

          if (this.nsp.connected.length === 0) {
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
      this.lastPoll = await PollsRepo.createPoll(poll.text, this.session,
          this.current.results, poll.shared, poll.type, this.current.answers);
      this.lastState = this.current;
      const pollNode = {
          id: this.lastPoll.id,
          text: poll.text,
          type: poll.type,
          options: poll.options,
          shared: poll.shared,
      };
      this.nsp.to('admins').emit('admin/poll/ended', { poll: pollNode });
      this.nsp.to('users').emit('user/poll/end', { poll });
      this.nsp.to('users').emit('user/question/end', { question: poll }); // v1
      this.current.poll = -1;
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
          this._clientError(client, 'No client address.');
          return;
      }

      // Start poll
      client.on('server/poll/start', async (pollObject: Object) => {
          const poll: Poll = {
              id: this.pollId,
              text: pollObject.text,
              type: pollObject.type,
              options: pollObject.options,
              shared: pollObject.shared,
          };
          this.pollId += 1;
          console.log('starting', poll);
          if (this.current.poll !== -1) {
              await this._endPoll();
          }
          this._startPoll(poll);
      });

      // v1
      client.on('server/question/start', async (questionObject: Object) => {
          const question: Poll = {
              id: this.pollId,
              text: questionObject.text,
              type: questionObject.type,
              options: questionObject.options,
              shared: false,
          };
          this.pollId += 1;
          console.log('starting', question);
          if (this.current.question !== -1) {
              await this._endPoll();
          }
          this._startPoll(question);
      });

      // share results
      client.on('server/poll/results', async () => {
          console.log('sharing results');
          // Update poll to 'shared'
          if (this.lastPoll) {
              await PollsRepo.updatePollById(this.lastPoll.id, null,
                  null, true);
          }
          const current = this.lastState;
          this.nsp.to('users').emit('user/poll/results', current);
      });

      // v1
      client.on('server/question/results', async () => {
          console.log('sharing results');
          if (this.lastPoll) {
              await PollsRepo.updatePollById(this.lastPoll.id, null,
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
      client.on('server/poll/end', () => {
          console.log('ending question');
          this._endPoll();
      });

      // v1
      client.on('server/question/end', () => {
          console.log('ending question');
          this._endPoll();
      });

      client.on('disconnect', async () => {
          console.log(`Admin ${client.id} disconnected.`);
          await SessionsRepo.addUsersByGoogleIds(this.session.id,
              this.adminGoogleIds, 'admin');
          this.adminGoogleIds = [];

          if (this.nsp.connected.length === 0) {
              this.onClose();
          }
      });
  }
}
