// @flow
import {
  createConnection,
  ConnectionOptions
} from 'typeorm';
import dotenv from 'dotenv';

// All entities
import {Base} from '../models/Base';
import {User} from '../models/User';
import {Session} from '../models/Session';
import {Course} from '../models/Course';
import {Lecture} from '../models/Lecture';
import {Question} from '../models/Question';
import {Response} from '../models/Response';
import {Organization} from '../models/Organization';

dotenv.config(); // establish env variables

const driver = {
  type: 'mysql',
  host: process.env.MYSQL_HOST,
  post: 3306,
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB
};

const entities = [
  Base,
  User,
  Session,
  Course,
  Lecture,
  Question,
  Response,
  Organization
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
