// @flow
import API from './API';
import dbConnection from './db/DbConnection';
import http from 'http';

type Error = {
  errno?: number;
  code?: string;
  path?: string;
  syscall?: string;
};

const app: API = new API();
const server: http.Server = http.createServer(app.express);
const port: number = 3000;

const onError = (error: Error): void => {
  if (error.syscall !== 'listen') throw error;
  switch (error.code) {
  case 'EACCES':
    console.error(`${port} requires elevated privileges`);
    process.exit(1);
  case 'EADDRINUSE':
    console.error(`${port} is already in use`);
    process.exit(1);
  default:
    throw error;
  }
};

const onListening = (): void => {
  let addr: Object = server.address();
  console.log(`Listening on ${addr.port}`);
};

// Bootstrap everything
dbConnection().then(_ => {
  server.on('error', onError);
  server.on('listening', onListening);
  server.listen(port);
}).catch(err => {
  console.log(err);
});
