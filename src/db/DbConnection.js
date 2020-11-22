// @flow
import dotenv from 'dotenv';
import {
  ConnectionOptions,
  createConnection,
} from 'typeorm';

// All entities
import Base from '../models/Base';
import Draft from '../models/Draft';
import Poll from '../models/Poll';
import Group from '../models/Group';
import User from '../models/User';
import UserSession from '../models/UserSession';
import { ChangeID1557207656455 } from './migrations/1557207656455-ChangeID.js';

dotenv.config(); // establish env variables
const isProduction = process.env.NODE_ENV === 'production';

const entities = [
  Base,
  Draft,
  Poll,
  Group,
  User,
  UserSession,
];

// Setup options
const connectionOptions: ConnectionOptions = {
  synchronize: true,  // switch back to !isProduction for release
  type: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  extra: {
    ssl: Object.prototype.hasOwnProperty.call(process.env, 'DB_SSL'),
  },
  entities,
  migrations: [],
  cli: {
    entitiesDir: 'src/models',
    migrationsDir: 'src/db/migrations',
  },
};

const dbConnection = (): Promise<any> => createConnection(connectionOptions)
  .then(async (connection) => {
    if (isProduction) await connection.runMigrations();
  });
export default dbConnection;
