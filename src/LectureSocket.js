// @flow
import type { SocketIO } from 'socket.io'

import http from 'http';
import { Lecture } from './models/Lecture';
import { remove } from './utils/lib'
import socket from 'socket.io';

export type LectureSocketConfig = {
  port: number,
  lecture: Lecture,
}

type id = number;
type IOSocket = Object;

type Question = {
  id: number,
  text: string,
  type: string,
}

type Answer = {
  id: id,
  question: id,
  answerer: id,
  type: string,
  data: string,
}

type CurrentState = {
  question: number,
}

type AnswerMap = {
  [number]: Answer
}

/**
 * Represents a single running lecture
 */
export default class LectureSocket {
  server: http.Server;
  io: SocketIO.Server;
  port: number;

  lecture: Lecture

  admins: Array<{ socket: IOSocket }>
  students: Array<{ socket: IOSocket }>

  /**
   * Stores all questions/answers for the lecture.
   */
  questions: {
    [number]: {
      question: Question,
      answers: AnswerMap,
    }
  }

  current: CurrentState = {
    question: -1
  }

  constructor({port, lecture}: LectureSocketConfig) {
    this.port = port;
    this.lecture = lecture;
  }

  start(): Promise<?Error> {
    return new Promise((res, rej) => {
      this.io = socket.listen(this.port)
      this.io.on('connect', this._onConnect.bind(this));
      this.io.httpServer.on('listening', res);
      this.io.httpServer.on('error', rej);
    });
  }

  close() {
    this.io.server.close()
    this.io.httpServer.close()
  }

  _clientError(client: IOSocket, msg: string): void {
    console.log(msg);
    // client.close()
    return;
  }

  _onConnect(client: IOSocket): void {
    const userType: ?string = client.handshake.query.userType || null;

    if (!userType) {
      this._clientError(client, 'Invalid user connected: no userType.')
      return;
    }

    if (userType === 'admin') {
      console.log(`Admin with id ${client.id} connected to socket`);
      this._setupProfessorEvents(client)
      this.admins[client.id] = {
        socket: client
      };
      return;
    }

    if (userType === 'student') {
      console.log(`Student with id ${client.id} connected to socket`);
      this._setupStudentEvents(client)
      this.students[client.id] = {
        socket: client
      };
      return;
    }

    this._clientError(client, `Invalid userType ${userType} connected.`)

  }

  /******************************* Student Side *******************************/

  /**
   * Events:
   * /question/respond
   * : Student wants to update its answer to a question
   * - Record the answer in volatile memory
   */
  _setupStudentEvents(client: IOSocket): void {

    const address: ?string = client.handshake.address;
    const netId: ?string = client.handshake.query.netId;

    if (!address) {
      this._clientError(client, `No client adderss.`)
      return;
    }

    if (!netId) {
      this._clientError(client, `No client netId.`)
      return;
    }

    client.on('server/question/respond', (answer: Answer) => {
      // todo: prevent spoofing
      const question = this._currentQuestion();
      if (question === null) {
        console.log(`Client ${client.id} sanswer on no question`)
        return;
      }
      this.questions[question.id].answers[answer.answerer] = answer;
    });

    client.on('disconnect', () => {
      console.log(`Student ${client.id} disconnected.`)
      remove(this.admins, ({ socket }) => socket.id === client.id)
    });
  }

  /****************************** Professor Side ******************************/

  _currentQuestion(): Question | null {
    if (this.current.question === -1) {
      return null;
    } else {
      return this.questions[this.current.question].question;
    }
  }

  _startQuestion(question: Question) {
    // start new question
    this.current.question = question.id;
    if (!this.questions[question.id]) {
      this.questions[question.id] = {
        question,
        answers: {},
      }
    }
    this.students.forEach(student => {
      student.socket.emit('student/question/start', {question});
    })
  }

  _endQuestion() {
    const question = this._currentQuestion()
    this.students.forEach(student => {
      student.socket.emit('student/question/end', {question});
    })
    this.current.question = -1;
  }

  /**
   * Events:
   * /question/start (quesiton: Question)
   * : Professor wants to start a question
   * - Creates cache to store answers
   * - Notifies clients new question has started
   * /question/end (void)
   * : Professor wants to close a question
   * - Persists recieved questions
   * - Notifies clients quesiton is now closed
   */
  _setupProfessorEvents(client: Object): void {
    const address = client.handshake.address;

    if (!address) {
      this._clientError(client, `No client adderss.`)
      return;
    }

    // Start question
    client.on('server/question/start', (question: Question) => {
      if (this.current.question != -1) {
        this._endQuestion()
      }
      this._startQuestion(question)
    });

    // End question
    client.on('server/question/end', () => {
      this._endQuestion()
    });

    client.on('disconnect', () => {
      console.log(`Admin ${client.id} disconnected.`)
      remove(this.admins, ({ socket }) => socket.id === client.id)
    });
  }
}

