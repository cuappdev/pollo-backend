// @flow
import dotenv from 'dotenv';
import {
    ConnectionOptions,
    createConnection,
} from 'typeorm';

// All entities
import Base from '../models/Base';
import { Change1549303297337 } from './migrations/1549303297337-Change';
import Draft from '../models/Draft';
import Poll from '../models/Poll';
import Question from '../models/Question';
import Group from '../models/Group';
import User from '../models/User';
import UserSession from '../models/UserSession';

dotenv.config(); // establish env variables

const driver = {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

const entities = [
    Base,
    Draft,
    Poll,
    Question,
    Group,
    User,
    UserSession,
];

// Setup options
const connectionOptions: ConnectionOptions = {
    driver,
    entities,
    migrations: [Change1549303297337],
    cli: {
        entitiesDir: 'src/models',
        migrationsDir: 'src/db/migrations',
    },
};

const dbConnection = (): Promise<any> => createConnection(connectionOptions)
    .then(async (connection) => {
        if (process.env.NODE_ENV === 'production') await connection.runMigrations();
    });
export default dbConnection;
