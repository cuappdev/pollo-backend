// @flow
import type { SocketIO } from 'socket.io'

import http from 'http';
import socket from 'socket.io';

export type LectureSocketConfig = {
  port: number
}

/**
 * Represents a single running lecture
 */
export default class LectureSocket {
  server: http.Server;
  io: SocketIO.Server;
  port: number;

  constructor({port}: LectureSocketConfig) {
    this.port = port;
  }

  start(): Promise<?Error> {
    return new Promise((res, rej) => {
      this.io = socket.listen(this.port)
      this.io.on('connect', this._onConnect);
      this.io.httpServer.on('listening', res);
      this.io.httpServer.on('error', rej);
    });
  }

  // close() {
  //   this.io.server.close()
  //   this.io.httpServer.close()
  // }

  _onConnect() {
    console.log('connected')
  }

}

