// @flow
import { Session } from './models/Session';
import SocketIO from 'socket.io';
import PollsRepo from './repos/PollsRepo';
import SessionsRepo from './repos/SessionsRepo';

export type SessionSocketConfig = {
  session: Session,
  nsp: SocketIO.Namespace,
  onClose: void => void
}

type id = number;
type IOSocket = Object;

type Poll = {
  id: number,
  text: string,
  type: string,
  options: ?string[]
}

type Answer = {
  id: id,
  googleId: string,
  poll: id,
  choice: string,
  text: string
}

type CurrentState = {
  poll: number,
  results: {}, // {'A': {'text': 'blue', 'count': 1}}
  answers: {} // id = client id, answer = current choice
}

/**
 * Represents a single running session
 */
export default class SessionSocket {
  session: Session
  nsp: SocketIO.Namespace
  onClose: void => void
  closing: boolean = false

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

  lastPoll = null;

  // Google ids of every admin/user who has joined the session
  adminGoogleIds = [];
  userGoogleIds = [];

  current: CurrentState = {
    poll: -1, // id of current poll object
    results: {},
    answers: {}
  }

  constructor ({ session, nsp, onClose }: SessionSocketConfig) {
    this.session = session;
    this.nsp = nsp;
    this.nsp.on('connect', this._onConnect.bind(this));
    this.onClose = onClose;

    this.polls = {};
    this.pollId = 0;
    this.answerId = 0;
  }

  saveSession () {
    console.log('save this sessioning session on user side');
    this.nsp.to('users').emit('user/session/save', this.session);
  }

  _clientError (client: IOSocket, msg: string): void {
    console.log(msg);
  }

  _onConnect (client: IOSocket): void {
    const userType: ?string = client.handshake.query.userType || null;
    const googleId: ?string = client.handshake.query.googleId || null;

    switch (userType) {
    case 'admin':
      console.log(`Admin with id ${client.id} connected to socket`);
      if (googleId && !this.adminGoogleIds.includes(googleId)) {
        this.adminGoogleIds.push(googleId);
      }
      this._setupAdminEvents(client);
      client.join('admins');
      break;
    case 'user':
      console.log(`User with id ${client.id} connected to socket`);
      if (googleId && !this.userGoogleIds.includes(googleId)) {
        this.userGoogleIds.push(googleId);
      }
      this._setupUserEvents(client);
      client.join('users');

      const currentPoll = this._currentPoll();
      if (currentPoll) {
        client.emit('user/poll/start', { poll: currentPoll });
      }
      break;
    default:
      if (!userType) {
        this._clientError(client, 'Invalid user connected: no userType.');
      } else {
        this._clientError(client, `Invalid userType ${userType} connected.`);
      }
    }
  }

  /** ***************************** User Side *************************** **/
  // i.e. the server hears 'server/poll/respond
  /**
   * Events:
   * /poll/respond
   * : User wants to update its answer to a poll
   * - Record the answer in volatile memory
   */
  _setupUserEvents (client: IOSocket): void {
    client.on('server/poll/tally', (answerObject: Object) => {
      const answer: Answer = {
        id: this.answerId,
        googleId: answerObject.googleId,
        poll: answerObject.poll,
        choice: answerObject.choice,
        text: answerObject.text
      };
      this.answerId++;
      const poll = this._currentPoll();
      if (poll === null) {
        console.log(`Client ${client.id} sanswer on no poll`);
        return;
      }
      if (poll.id !== answer.poll) {
        console.log(`Poll ${answer.poll} is not the current poll`);
        return;
      }

      let nextState = {...this.current};
      const prev = nextState.answers[answer.googleId];
      nextState.answers[answer.googleId] = answer.choice; // update/add response
      if (prev) { // if truthy
        // has selected something before
        nextState.results[prev].count -= 1;
        const poll = this._currentPoll();
        if (poll && poll.type === 'FREE_RESPONSE') {
          if (nextState.results[prev].count <= 0) {
            delete nextState.results[prev];
          }
        }
      }

      let curTally = nextState.results[answer.choice];
      if (curTally) { // if truthy
        nextState.results[answer.choice].count += 1;
      } else {
        nextState.results[answer.choice] = {'text': answer.text, 'count': 1};
      }

      this.current = nextState;
      this.nsp.to('admins').emit('admin/poll/updateTally', this.current);
    });

    client.on('disconnect', () => {
      console.log(`User ${client.id} disconnected.`);
      if (this.nsp.connected.length === 0) {
        this.onClose();
      }
    });
  }

  /** *************************** Admin Side *************************** **/

  _currentPoll (): Poll | null {
    if (this.current.poll === -1) {
      return null;
    } else {
      return this.polls[`${this.current.poll}`].poll;
    }
  }

  _startPoll (poll: Poll) {
    // start new poll
    this.current.poll = poll.id;
    if (!this.polls[`${poll.id}`]) {
      this.polls[`${poll.id}`] = {
        poll,
        answers: {}
      };
    }
    var results = {};
    if (poll.options) {
      for (var i = 0; i < poll.options.length; i++) {
        results[String.fromCharCode(65 + i)] =
          {'text': poll.options[i], 'count': 0};
      }
    }
    this.current.results = results;
    this.current.answers = {};

    this.nsp.to('users').emit('user/poll/start', { poll });
  }

  _endPoll = async () => {
    const poll = this._currentPoll();
    if (!poll) {
      return;
    }
    this.lastPoll = await PollsRepo.createPoll(poll.text,
      this.session, this.current.results, false);
    this.nsp.to('users').emit('user/poll/end', {poll});
  }

  /**
   * Events:
   * /poll/start (quesiton: Poll)
   * : Admin wants to start a poll
   * - Creates cache to store answers
   * - Notifies clients new poll has started
   * /poll/end (void)
   * : Admin wants to close a poll
   * - Persists recieved polls
   * - Notifies clients quesiton is now closed
   */
  _setupAdminEvents (client: Object): void {
    const address = client.handshake.address;

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
        options: pollObject.options
      };
      this.pollId++;
      console.log('starting', poll);
      if (this.current.poll !== -1) {
        await this._endPoll();
      }
      this._startPoll(poll);
    });

    // share results
    client.on('server/poll/results', async () => {
      const poll = this._currentPoll();
      if (poll === null) {
        console.log(`Admin ${client.id} sharing results on no poll`);
        return;
      }
      console.log('sharing results');
      // Update poll to 'shared'
      if (this.lastPoll) {
        await PollsRepo.updatePollById(this.lastPoll.id, null,
          null, true);
      }
      const current = this.current;
      this.nsp.to('users').emit('user/poll/results', current);
    });

    // End poll
    client.on('server/poll/end', () => {
      console.log('ending quesiton');
      this._endPoll();
    });

    client.on('disconnect', async () => {
      console.log(`Admin ${client.id} disconnected.`);
      await SessionsRepo.addUsersByGoogleIds(this.session.id,
        this.userGoogleIds, 'user');
      await SessionsRepo.addUsersByGoogleIds(this.session.id,
        this.adminGoogleIds, 'admin');
      if (this.nsp.connected.length === 0) {
        this.onClose();
      }
    });
  }
}
