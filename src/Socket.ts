import * as socket from 'socket.io';

/*
 * The Socket class manages socket.io server
 */
export class Socket {

  // Socket
  private io: SocketIO.Server;

  /*
   * Initialize the IndexRouter
   */
  constructor (server, port) {
    this.io = socket(server);
    console.log('Socket.io listening on port', port)
    this.io.on('connection', this.onConnect);
  }

  /*
   * On connect
   */
  onConnect (client): void {
    console.log('Client connected to socket');

    client.on('disconnect', this.onDisconnect);
  };

  /*
   * On disconnect
   */
  onDisconnect (): void {
    console.log('Client disconnected');
  };
}
