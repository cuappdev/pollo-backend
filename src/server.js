// @flow
import http from 'http';
import API from './API';
import dbConnection from './db/DbConnection';
import GroupManager from './GroupManager';

type Error = {
  errno?: number;
  code?: string;
  path?: string;
  syscall?: string;
};

const app: API = new API();
const server: http.Server = http.createServer(app.express);
app.express.groupManager = new GroupManager(server);
const port: number = 3000;

const onError = (error: Error): void => {
  if (error.syscall !== 'listen') throw error;
  switch (error.code) {
    case 'EACCES':
      console.error(`${port} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${port} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
};

const onListening = (): void => {
  const addr: Object = server.address();
  console.log(`Listening on ${addr.port} (${process.env.NODE_ENV || 'development'})`);
};

// Bootstrap everything
dbConnection().then((_) => {
  server.on('error', onError);
  server.on('listening', onListening);
  server.listen(port);
}).catch((err) => {
  console.log(err);
});
