// @flow
import dotenv from 'dotenv';
import {
    ConnectionOptions,
    createConnection,
} from 'typeorm';

// All entities
import Base from '../models/Base';
import Change1521233644145 from './migrations/Change1521233644145';
import Draft from '../models/Draft';
import Poll from '../models/Poll';
import Question from '../models/Question';
import Session from '../models/Session';
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
    Session,
    User,
    UserSession,
];

const autoSchemaSync = true;

// Setup options
const connectionOptions: ConnectionOptions = {
    driver,
    entities,
    autoSchemaSync,
    migrations: [Change1521233644145],
    cli: {
        entitiesDir: 'src/models',
        migrationsDir: 'src/db/migrations',
    },
};

const dbConnection = (): Promise<any> => createConnection(connectionOptions).then(async (connection) => {
    // run all migrations
    // await connection.runMigrations();

    // and undo previous migration
    // await connection.undoLastMigration();

    // console.log('Done. We run two migrations then reverted them.');
});

export default dbConnection;
