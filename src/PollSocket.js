// @flow
import type { SocketIO } from 'socket.io';

import http from 'http';
import { Poll } from './models/Poll';
import { remove } from './utils/lib';
import socket from 'socket.io';

export type PollSocketConfig = {
  port: number,
  poll: Poll,
}

type id = number;
type IOSocket = Object;

type Question = {
  id: number,
  text: string,
  type: string,
  options: ?string[]
}

type Answer = {
  id: id,
  deviceId: id,
  question: id,
  data: string
}

type CurrentState = {
  question: number,
  results: {}, // {'A': 1, 'C': 2}
  answers: {} // id = client id, answer = "current answer"
}

/**
 * Represents a single running poll
 */
export default class PollSocket {
  server: http.Server;
  io: SocketIO.Server;
  port: number;

  poll: Poll

  admins: Array<{ socket: IOSocket }> = []
  users: Array<{ socket: IOSocket }> = []

  /**
   * Stores all questions/answers for the poll.
   */
  questions: {
    [string]: {
      question: Question,
      answers: {
        [string]: Answer
      }
    }
  }

  current: CurrentState = {
    question: -1, // id of current question object
    results: {},
    answers: {}
  }

  constructor ({port, poll}: PollSocketConfig) {
    this.port = port;
    this.poll = poll;
    this.questions = {};
  }

  start (): Promise<?Error> {
    return new Promise((resolve, reject) => {
      this.io = socket.listen(this.port);
      // Whitelist all origins
      this.io.origins('*:*');
      this.io.on('connect', this._onConnect.bind(this));
      this.io.httpServer.on('listening', resolve);
      this.io.httpServer.on('error', reject);
    });
  }

  close () {
    this.io.server.close();
    this.io.httpServer.close();
  }

  _clientError (client: IOSocket, msg: string): void {
    console.log(msg);
    // client.close()
  }

  _onConnect (client: IOSocket): void {
    const userType: ?string = client.handshake.query.userType || null;
    switch (userType) {
    case 'admin':
      console.log(`Admin with id ${client.id} connected to socket`);
      this._setupAdminEvents(client);
      this.admins.push({
        socket: client
      });
      break;
    case 'user':
      console.log(`User with id ${client.id} connected to socket`);
      this._setupUserEvents(client);
      this.users.push({
        socket: client
      });
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
  // i.e. the server hears 'server/question/respond
  /**
   * Events:
   * /question/respond
   * : User wants to update its answer to a question
   * - Record the answer in volatile memory
   */
  _setupUserEvents (client: IOSocket): void {
    client.on('server/question/respond', (answer: Answer) => {
      // todo: prevent spoofing
      const question = this._currentQuestion();
      if (question === null) {
        console.log(`Client ${client.id} sanswer on no question`);
        return;
      }
      this.questions[`${question.id}`].answers[`${answer.deviceId}`] = answer;
    });

    client.on('server/question/tally', (answer: Answer) => {
      const question = this._currentQuestion();
      if (question === null) {
        console.log(`Client ${client.id} sanswer on no question`);
        return;
      }
      if(question !== answer.question) {
        console.log(`Question ${answer.question} is not the current question`);
        return;
      }

      let nextState = {...this.current};
      const prev = nextState.answers[answer.deviceId];
      nextState.answers[answer.deviceId] = answer.data; // update/input user's response
      if(prev) {// if truthy
        // has selected something before
        nextState.results[prev] -= 1;
      }

      let cur_tally = nextState.results[answer.data];
      if(cur_tally) { // if truthy
        nextState.results[answer.data] += 1;
      } else {
        nextState.results[answer.data] = 1; 
      }

      this.current = nextState;
      this.admins.forEach(admin => {
        admin.socket.emit('admin/question/updateTally', this.current);
      })
    });

    client.on('disconnect', () => {
      console.log(`User ${client.id} disconnected.`);
      remove(this.admins, ({ socket }) => socket.id === client.id);
    });
  }

  /** *************************** Admin Side *************************** **/

  _currentQuestion (): Question | null {
    if (this.current.question === -1) {
      return null;
    } else {
      return this.questions[`${this.current.question}`].question;
    }
  }

  _startQuestion (question: Question) {
    // start new question
    this.current.question = question.id;
    if (!this.questions[`${question.id}`]) {
      this.questions[`${question.id}`] = {
        question,
        answers: {}
      };
    }
    this.users.forEach(user => {
      user.socket.emit('user/question/start', {question});
    });
  }

  _endQuestion () {
    const question = this._currentQuestion();
    if (!question) {
      // no question to end
      return;
    }
    this.users.forEach(user => {
      user.socket.emit('user/question/end', {question});
    });
    this.current.question = -1;
  }

  /**
   * Events:
   * /question/start (quesiton: Question)
   * : Admin wants to start a question
   * - Creates cache to store answers
   * - Notifies clients new question has started
   * /question/end (void)
   * : Admin wants to close a question
   * - Persists recieved questions
   * - Notifies clients quesiton is now closed
   */
  _setupAdminEvents (client: Object): void {
    const address = client.handshake.address;

    if (!address) {
      this._clientError(client, 'No client address.');
      return;
    }

    // Start question
    client.on('server/question/start', (question: Question) => {
      console.log('starting', question);
      if (this.current.question !== -1) {
        this._endQuestion();
      }
      this._startQuestion(question);
    });

    // share results
    client.on('server/question/results', (state: CurrentState) => {
      const question = this._currentQuestion();
      if (question === null) {
        console.log(`Admin ${client.id} sharing results on no question`);
        return;
      }
      console.log('sharing results');
      const current = this.current;
      this.users.forEach(user => {
        user.socket.emit('user/question/results', current);
      });

    });

    // save poll code
    client.on('server/poll/save', () => {
      console.log('save this polling session on user side');
      this.users.forEach(user => {
        user.socket.emit('user/poll/save', this.poll);
      });
    });

    // End question
    client.on('server/question/end', () => {
      console.log('ending quesiton');
      this._endQuestion();
    });

    client.on('disconnect', () => {
      console.log(`Admin ${client.id} disconnected.`);
      remove(this.admins, ({ socket }) => socket.id === client.id);
    });
  }
}
