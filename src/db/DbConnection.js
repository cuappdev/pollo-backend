// @flow
import {
  createConnection,
  ConnectionOptions
} from 'typeorm';
import dotenv from 'dotenv';

// All entities
import {Base} from '../models/Base';
import {Poll} from '../models/Poll';
import {Question} from '../models/Question';
import {User} from '../models/User';
import {Session} from '../models/Session';

dotenv.config(); // establish env variables

const driver = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

const entities = [
  Base,
  Poll,
  Question,
  User,
  Session
];

const autoSchemaSync = true;

// Setup options
const connectionOptions: ConnectionOptions = {
  driver: driver,
  entities: entities,
  autoSchemaSync: autoSchemaSync
};

const dbConnection = (): Promise<any> => {
  return createConnection(connectionOptions);
};

export default dbConnection;
