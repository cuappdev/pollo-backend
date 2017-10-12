// @flow
import http from 'http';
import socket from 'socket.io';

class SocketServer {
  server: http.Server;
  port: number;
  io: Object;
  rooms: Object;
  professors: Object;
  students: Object;
  lectures: Object;

  constructor() {
    this.rooms = {};
    this.professors = {};
    this.students = {};
    this.lectures = {};
  }

  runServer (): void {
    this.server.listen(this.port);
  }

  on (action: string, callback: Function) {
    this.server.on(action, callback);
  }

  setupSocket (): void {
    this.io = socket(this.server);
    console.log('Socket.io listening on port', this.port);
    this.io.on('connect', this._onConnect);
  }

  // Handle client socket connection
  _onConnect = (client: Object): void => {
    const userType = client.handshake.query.userType;

    if (userType === 'professor') {
      console.log(`Professor with id ${client.id} connected to socket`);
      this.professors[client.id] = {
        socket: client,
        lectureId: null,
        questions: {}
      };
      this._setupProfessorEvents(client);
    } else {
      console.log(`Student with id ${client.id} connected to socket`);
      this.students[client.id] = {
        socket: client
      };
      this._setupStudentEvents(client);
    }

    // Handle client socket disconnection
    client.on('disconnect', () => {
      if (userType === 'professor') {
        console.log(`Professor with id ${client.id} disconnected from socket`);
      } else {
        console.log(`Student with id ${client.id} disconnected from socket`);
      }
    });
  };

  _setupProfessorEvents = (client: Object): void => {
    const address = client.handshake.address;

    // Start question
    client.on('question-start', (question: Object) => {
      const room = this._getLectureId(client.id);
      const questionId = Object.keys(this.professors[client.id].questions).length + 1;
      this.professors[client.id].questions = Object.assign({}, {
        ...this.professors[client.id].questions,
        [questionId]: question
      });
      if (room) {
        this._messageRoom(room, 'question-start', {
          ...question,
          id: questionId
        });
      }
    });

    // End question which causes students to submit responses
    client.on('question-end', () => {
      const room = this._getLectureId(client.id);
      if (room) {
        this._messageRoom(room, 'question-end');
      }
    });
  }

  _setupStudentEvents = (client: Object): void => {
    const address = client.handshake.address;
    const netId = client.handshake.query.netId;

    client.on('question-response', (data: Object) => {
      console.log(`Student ${client.id} response index: ${data.response}`);
      this.lectures[data.lectureId].students[client.id].responses[data.questionId] = data.response;
    });
  }

  /*
   * Lecture methods [start, end, join]
   */

  // Start a lecture - create a room given the lecture id
  startLecture(profId: string, lectureId: string): boolean {
    if (this.lectures[lectureId]) {
      console.log('This lecture is already in session');
      return false;
    }
    console.log(`STARTING lecture (room \'${lectureId}\')`);
    this._createRoom(lectureId);
    this.professors[profId] = Object.assign({}, {
      ...this.professors[profId],
      lectureId: lectureId
    })
    this.lectures[lectureId] = {
      professor: profId,
      students: {}
    };
    console.log(this.lectures);
    return true;
  }

  // End lecture by disconnecting client sockets and removing namespace
  endLecture = (profId: string, lectureId: string): boolean => {
    try {
      const lecture = this.lectures[lectureId];
      if (!lecture) {
        throw new Error('No lecture with id /' + lectureId);
      }
      if (this._getLectureId(profId) !== lectureId) {
        throw new Error('Invalid access to this lectureId')
      }
      if (lecture.professor !== profId) {
        throw new Error('Professor lacks permission to end lecture /' + lectureId);
      }
      console.log(`ENDING lecture (room \'${lectureId}\')`);
      Object.keys(lecture.students).map((id: string) => {
        this.students[id].disconnect();
      });
      this._deleteRoom(lectureId);
      delete this.lectures[lectureId];
    } catch (error) {
      console.log(error.message);
      return false;
    }
    return true;
  }

  // Have the client socket join a lecture if allowed
  joinLecture = (clientId: string, lectureId: string): boolean => {
    const client = this.students[clientId].socket;
    var isValid = this._validateStudent(client, lectureId);
    if (isValid) {
      if (this.lectures[lectureId].students[clientId]) return false;
      console.log(`Student ${client.id} joined lecture ${lectureId}`);
      client.join(lectureId);
      this.lectures[lectureId].students[clientId] = { responses: {} };
      console.log(this.lectures);
      client.on('disconnect', () => this.leaveLecture(client, lectureId));
    }
    return isValid;
  }

  leaveLecture = (client: Object, lectureId: string): void => {
    client.leave(lectureId);
    const students = this.lectures[lectureId].students;
    delete students[client.id];
    this.lectures[lectureId] = {
      ...this.lectures[lectureId],
      students: students
    }
    console.log(`Student ${client.id} left lecture ${lectureId}`);
  }

  // Validate that this student is allowed to join this lecture
  _validateStudent = (client: Object, lectureId: string): boolean => {
    // TODO - Validate this user
    return true;
  }

  // Returns the current lecture id for the professor
  _getLectureId = (profId: string): string => {
    return this.professors[profId].lectureId;
  }

  /*
   * Room functions [create, message, delete]
   */

  // Creates and returns a new room
  _createRoom = (name: string): void => {
    // TODO
    this.rooms[name] = true;
  }

  // Messages the clients in the specified room
  _messageRoom = (room: string, msg: string, data?: Object): void => {
    this.io.to(room).emit(msg, data);
  }

  // Removes the clients from a room and delete the room
  _deleteRoom = (room: string) => {
    // TODO
    delete this.rooms[room];
  }
}

const socketServer = new SocketServer();

export default socketServer;
