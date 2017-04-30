import * as http from 'http';
import socket from 'socket.io';

export default (server, port) => {
  const io = socket(server);

  io.on('connection', onConnect);
};

var onConnect = (client) => {
  console.log('Client connected to socket');

  client.on('disconnect', onDisconnect);
};

var onDisconnect = () => {
  console.log('Client disconnected');
};
