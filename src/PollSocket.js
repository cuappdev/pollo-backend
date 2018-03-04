// @flow
import { Poll } from './models/Poll';
import SocketIO from 'socket.io';
import QuestionsRepo from './repos/QuestionsRepo';

export type PollSocketConfig = {
  poll: Poll,
  nsp: SocketIO.Namespace,
  onClose: void => void
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
  deviceId: string,
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
  poll: Poll
  nsp: SocketIO.Namespace
  onClose: void => void
  closing: boolean = false

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

  // Counter for generating question/answer ids
  questionId: number;
  answerId: number;

  current: CurrentState = {
    question: -1, // id of current question object
    results: {},
    answers: {}
  }

  constructor ({ poll, nsp, onClose }: PollSocketConfig) {
    this.poll = poll;
    this.nsp = nsp;
    this.nsp.on('connect', this._onConnect.bind(this));
    this.onClose = onClose;

    this.questions = {};
    this.questionId = 0;
    this.answerId = 0;
  }

  savePoll () {
    console.log('save this polling session on user side');
    this.nsp.to('users').emit('user/poll/save', this.poll);
  }

  _clientError (client: IOSocket, msg: string): void {
    console.log(msg);
  }

  _onConnect (client: IOSocket): void {
    const userType: ?string = client.handshake.query.userType || null;
    switch (userType) {
    case 'admin':
      console.log(`Admin with id ${client.id} connected to socket`);
      this._setupAdminEvents(client);
      client.join('admins');
      break;
    case 'user':
      console.log(`User with id ${client.id} connected to socket`);
      this._setupUserEvents(client);
      client.join('users');

      const currentQuestion = this._currentQuestion();
      if (currentQuestion) {
        client.emit('user/question/start', { question: currentQuestion });
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
  // i.e. the server hears 'server/question/respond
  /**
   * Events:
   * /question/respond
   * : User wants to update its answer to a question
   * - Record the answer in volatile memory
   */
  _setupUserEvents (client: IOSocket): void {
    client.on('server/question/tally', (answerObject: Object) => {
      const answer: Answer = {
        id: this.answerId,
        deviceId: answerObject.deviceId,
        question: answerObject.question,
        data: answerObject.data
      };
      this.answerId++;
      const question = this._currentQuestion();
      if (question === null) {
        console.log(`Client ${client.id} sanswer on no question`);
        return;
      }
      if (question.id !== answer.question) {
        console.log(`Question ${answer.question} is not the current question`);
        return;
      }

      let nextState = {...this.current};
      const prev = nextState.answers[answer.deviceId];
      nextState.answers[answer.deviceId] = answer.data; // update/input user's response
      if (prev) { // if truthy
        // has selected something before
        nextState.results[prev] -= 1;
      }

      let curTally = nextState.results[answer.data];
      if (curTally) { // if truthy
        nextState.results[answer.data] += 1;
      } else {
        nextState.results[answer.data] = 1;
      }

      this.current = nextState;
      this.nsp.to('admins').emit('admin/question/updateTally', this.current);
    });

    client.on('disconnect', () => {
      console.log(`User ${client.id} disconnected.`);
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

    this.nsp.to('users').emit('user/question/start', { question });
  }

  _endQuestion = async () => {
    const question = this._currentQuestion();
    if (!question) {
      return;
    }
    await QuestionsRepo.createQuestion(question.text, this.poll,
      this.current.results);
    this.nsp.to('users').emit('user/question/end', {question});
    this.current.answers = {};
    this.current.results = {};
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
    client.on('server/question/start', (questionObject: Object) => {
      const question: Question = {
        id: this.questionId,
        text: questionObject.text,
        type: questionObject.type,
        options: questionObject.options
      };
      this.questionId++;
      console.log('starting', question);
      if (this.current.question !== -1) {
        this._endQuestion();
      }
      this._startQuestion(question);
    });

    // share results
    client.on('server/question/results', () => {
      const question = this._currentQuestion();
      if (question === null) {
        console.log(`Admin ${client.id} sharing results on no question`);
        return;
      }
      console.log('sharing results');
      const current = this.current;
      this.nsp.to('users').emit('user/question/results', current);
    });

    // End question
    client.on('server/question/end', () => {
      console.log('ending quesiton');
      this._endQuestion();
    });

    client.on('disconnect', () => {
      console.log(`Admin ${client.id} disconnected.`);
      this.onClose();
    });
  }
}
