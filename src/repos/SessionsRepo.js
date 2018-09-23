// @flow
import { getConnectionManager, Repository } from 'typeorm';
import Poll from '../models/Poll';
import Question from '../models/Question';
import Session from '../models/Session';
import User from '../models/User';
import appDevUtils from '../utils/appDevUtils';
import constants from '../utils/constants';
import UsersRepo from './UsersRepo';

const db = (): Repository<Session> => getConnectionManager().get().getRepository(Session);

/** Contains all session codes used mapped to session id */
const sessionCodes = {};

/**
 * Creates a session and saves it to the db
 * @function
 * @param {string} name - Name of session
 * @param {string} code - Unique code used to join session
 * @param {User} [user] - Admin of session
 * @return {Session} Created session
 */
const createSession = async (name: string, code: string, user: ?User):
  Promise<Session> => {
    try {
        const session = new Session();
        session.name = name;
        session.code = code;
        session.admins = user ? [user] : [];

        if (sessionCodes[code]) {
            throw new Error('Session code is already in use');
        }

        await db().persist(session);
        sessionCodes[session.code] = session.id;

        return session;
    } catch (e) {
        throw new Error('Problem creating session!');
    }
};

/**
 * Generates a unique session code
 * @function
 * @return {string} Unique code
 */
const createCode = (): string => {
    let code;
    do {
        code = appDevUtils.randomCode(6);
    } while (sessionCodes[code]);

    return code;
};

/**
 * Get a session by id
 * @function
 * @param {number} id - Id of session to fetch
 * @return {?Session} Session with specified id
 */
const getSessionById = async (id: number): Promise<?Session> => {
    try {
        return await db().findOneById(id);
    } catch (e) {
        throw new Error(`Problem getting session by id: ${id}!`);
    }
};

/**
 * Get a session id by the session's unique code
 * @function
 * @param {string} code - Unique code of session to fetch
 * @return {?number} Id of session with given code
 */
const getSessionId = async (code: string) => {
    const session = await db().createQueryBuilder('sessions')
        .where('sessions.code = :sessionCode')
        .setParameters({ sessionCode: code })
        .getOne();
    return session ? session.id : null;
};

/**
 * Delete a session
 * @function
 * @param {number} id - Id of session to delete
 */
const deleteSessionById = async (id: number) => {
    try {
        const session = await db().findOneById(id);
        delete sessionCodes[session.code];

        await db().remove(session);
    } catch (e) {
        throw new Error(`Problem deleting session by id: ${id}!`);
    }
};

/**
 * Update a session
 * @function
 * @param {number} id - Id of session to update
 * @param {string} name - New name of session
 * @return {?Session} Updated session
 */
const updateSessionById = async (id: number, name: string):
  Promise<?Session> => {
    try {
        const field = {};
        if (name !== undefined && name !== null) {
            field.name = name;
            await db().createQueryBuilder('sessions')
                .where('sessions.id = :sessionId')
                .setParameters({ sessionId: id })
                .update(field)
                .execute();
        }
        
        return await db().findOneById(id);
    } catch (e) {
        throw new Error(`Problem updating session by id: ${id}!`);
    }
};

/**
 * Add users (admins or members) to a session
 * @function
 * @param {number} id - Id of session to add users
 * @param {string[]} googleIds - List of user's google ids to add
 * @param {string} [role] - Specifies whether to add the users as members or admins
 * @return {?Session} Session that users were added to
 */
const addUsersByGoogleIds = async (id: number, googleIds: string[],
    role: ?string): Promise<?Session> => {
    try {
        const session = await db().createQueryBuilder('sessions')
            .leftJoinAndSelect('sessions.admins', 'admins')
            .leftJoinAndSelect('sessions.members', 'members')
            .leftJoinAndSelect('sessions.polls', 'polls')
            .leftJoinAndSelect('sessions.questions', 'questions')
            .where('sessions.id = :sessionId')
            .setParameters({ sessionId: id })
            .getOne();
        if (session) {
            if (role === constants.USER_TYPES.ADMIN) {
                const currAdminIds = session.admins.map(admin => admin.googleId);
                const users = await UsersRepo
                    .getUsersByGoogleIds(googleIds, currAdminIds);
                session.admins = session.admins.concat(users);
            } else {
                const currMemberIds = session.members.map(user => user.googleId);
                const users = await UsersRepo
                    .getUsersByGoogleIds(googleIds, currMemberIds);
                session.members = session.members.concat(users);
            }
        }

        await db().persist(session);
        return session;
    } catch (e) {
        throw new Error('Problem adding users to session by google ids!');
    }
};

/**
 * Add users (admins or members) to a session
 * @function
 * @param {number} id - Id of session to add users
 * @param {number[]} userIds - List of user ids to add
 * @param {string} [role] - Specifies whether to add the users as members or admins
 * @return {?Session} Session that users were added to
 */
const addUsersByIds = async (id: number, userIds: number[],
    role: ?string): Promise<?Session> => {
    try {
        const session = await db().createQueryBuilder('sessions')
            .leftJoinAndSelect('sessions.admins', 'admins')
            .leftJoinAndSelect('sessions.members', 'members')
            .leftJoinAndSelect('sessions.polls', 'polls')
            .leftJoinAndSelect('sessions.questions', 'questions')
            .where('sessions.id = :sessionId')
            .setParameters({ sessionId: id })
            .getOne();
        if (session) {
            if (role === constants.USER_TYPES.ADMIN) {
                const currAdminIds = session.admins.map(admin => admin.id);
                const admins = await UsersRepo.getUsersFromIds(userIds, currAdminIds);
                session.admins = session.admins.concat(admins);
            } else {
                const currMemberIds = session.members.map(member => member.id);
                const members = await UsersRepo.getUsersFromIds(userIds, currMemberIds);
                session.members = session.members.concat(members);
            }
        }

        await db().persist(session);
        return session;
    } catch (e) {
        throw new Error('Problem adding users to session by ids!');
    }
};

/**
 * Remove user from session
 * @function
 * @param {number} id - Id of session to remove user from
 * @param {User} user - User to remove from session
 * @param {string} [role] - Role to remove user from
 * @return {?Session} Session without specified user
 */
const removeUserBySessionId = async (id: number, user: User, role: ?string):
  Promise<?Session> => {
    try {
        const session = await db().createQueryBuilder('sessions')
            .leftJoinAndSelect('sessions.admins', 'admins')
            .leftJoinAndSelect('sessions.members', 'members')
            .leftJoinAndSelect('sessions.polls', 'polls')
            .leftJoinAndSelect('sessions.questions', 'questions')
            .where('sessions.id = :sessionId')
            .setParameters({ sessionId: id })
            .getOne();
        if (user) {
            if (role === constants.USER_TYPES.ADMIN) {
                session.admins = session.admins.filter(admin => admin.googleId !== user.googleId);
            } else {
                session.members = session.members
                    .filter(member => member.googleId !== user.googleId);
            }
            await db().persist(session);
        }

        return session;
    } catch (e) {
        throw new Error(`Problem removing admin from session by id: ${id}`);
    }
};

/**
 * Checks if user is an admin of given session
 * @function
 * @param {number} id - Id of session to check admins
 * @param {User} user - User that we want to check if they're an admin
 * @return {?boolean} Whether the given user is an admin of the given session
 */
const isAdmin = async (id: number, user: User):
  Promise<?boolean> => {
    try {
        const session = await db().createQueryBuilder('sessions')
            .leftJoinAndSelect('sessions.admins', 'admins')
            .where('sessions.id = :sessionId')
            .setParameters({ sessionId: id })
            .getOne();

        const admin = session.admins.find(x => x.googleId === user.googleId);
        return admin !== undefined;
    } catch (e) {
        throw new Error(`Problem verifying admin status for session ${id}`);
    }
};

/**
 * Checks if user is a member of given session
 * @function
 * @param {number} id - Id of session to check members
 * @param {User} user - User that we want to check if they're a member
 * @return {?boolean} Whether the given user is a member of the given session
 */
const isMember = async (id: number, user: User):
  Promise<?boolean> => {
    try {
        const session = await db().createQueryBuilder('sessions')
            .leftJoinAndSelect('sessions.members', 'members')
            .where('sessions.id = :sessionId')
            .setParameters({ sessionId: id })
            .getOne();

        const member = session.members.find(x => x.googleId === user.googleId);
        return member !== undefined;
    } catch (e) {
        throw new Error(`Problem verifying member status for session ${id}`);
    }
};

/**
 * Get users from a session
 * @function
 * @param {number} id - Id of session to get users
 * @param {string} [role] - Specifies if we only want users of a certain role
 * @return {User[]} List of specified user from session
 */
const getUsersBySessionId = async (id: number, role: ?string):
  Promise<Array<?User>> => {
    try {
        const session = await db().createQueryBuilder('sessions')
            .leftJoinAndSelect('sessions.admins', 'admins')
            .leftJoinAndSelect('sessions.members', 'members')
            .where('sessions.id = :sessionId')
            .setParameters({ sessionId: id })
            .getOne();
        if (role === constants.USER_TYPES.ADMIN) {
            return session.admins;
        } if (role === constants.USER_TYPES.MEMBER) {
            return session.members;
        }
        return session.admins.concat(session.members);
    } catch (e) {
        throw new Error(`Problem getting admins for session with id: ${id}!`);
    }
};

/**
 * Gets polls from a session sorted by creation date desc.
 * @function
 * @param {number} id - Id of session to fetch polls from
 * @return {Poll[]} List of polls from session
 */
const getPolls = async (id: number):
  Promise<Array<?Poll>> => {
    try {
        const session = await db().createQueryBuilder('sessions')
            .leftJoinAndSelect('sessions.polls', 'polls')
            .where('sessions.id = :sessionId')
            .setParameters({ sessionId: id })
            .orderBy('polls.createdAt', 'DESC')
            .getOne();
        return session.polls;
    } catch (e) {
        throw new Error('Problem getting polls');
    }
};

/**
 * Get questions from a session sorted by creation date desc.
 * @function
 * @param {number} id - Id of session to fetch questions from
 * @return {Question[]} List of questions rom session
 */
const getQuestions = async (id: number): Promise<Array<?Question>> => {
    try {
        const session = await db().createQueryBuilder('sessions')
            .leftJoinAndSelect('sessions.questions', 'questions')
            .where('sessions.id = :sessionId')
            .setParameters({ sessionId: id })
            .orderBy('questions.createdAt', 'DESC')
            .getOne();
        return session.questions;
    } catch (e) {
        throw new Error('Problem getting questions');
    }
};

export default {
    sessionCodes,
    createSession,
    createCode,
    getSessionById,
    getSessionId,
    updateSessionById,
    deleteSessionById,
    addUsersByGoogleIds,
    removeUserBySessionId,
    getUsersBySessionId,
    isAdmin,
    isMember,
    getPolls,
    getQuestions,
    addUsersByIds,
};
