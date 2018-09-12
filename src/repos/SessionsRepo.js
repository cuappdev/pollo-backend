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

// Contains all session codes used mapped to session id
const sessionCodes = {};

// Create a session
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

// Generate unique session code
const createCode = (): string => {
    let code;
    do {
        code = appDevUtils.randomCode(6);
    } while (sessionCodes[code]);

    return code;
};

// Get a session by Id
const getSessionById = async (id: number): Promise<?Session> => {
    try {
        return await db().findOneById(id);
    } catch (e) {
        throw new Error(`Problem getting session by id: ${id}!`);
    }
};

// Get a session id from session code
const getSessionId = async (code: string) => {
    const session = await db().createQueryBuilder('sessions')
        .where('sessions.code = :sessionCode')
        .setParameters({ sessionCode: code })
        .getOne();
    return session ? session.id : null;
};

// Delete a session by Id
const deleteSessionById = async (id: number) => {
    try {
        const session = await db().findOneById(id);
        delete sessionCodes[session.code];

        await db().remove(session);
    } catch (e) {
        throw new Error(`Problem deleting session by id: ${id}!`);
    }
};

// Update a session by Id
const updateSessionById = async (id: number, name: ?string):
  Promise<?Session> => {
    try {
        const field = {};
        if (name) field.name = name;
        await db().createQueryBuilder('sessions')
            .where('sessions.id = :sessionId')
            .setParameters({ sessionId: id })
            .update(field)
            .execute();
        return await db().findOneById(id);
    } catch (e) {
        throw new Error(`Problem updating session by id: ${id}!`);
    }
};

// Add a list of admins/member googleIds to a session by googleId
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

// Add a list of admins/member ids to a session
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

// Remove admin/member of a session by Id
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
                session.admins = session.admins.filter(admin => (admin.googleId !== user.googleId));
            } else {
                session.members = session.members.filter(member => (member.googleId !== user.googleId));
            }
            await db().persist(session);
        }

        return session;
    } catch (e) {
        throw new Error(`Problem removing admin from session by id: ${id}`);
    }
};

// Return true if user is an admin of a session by id
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

// Return true if user is an member of a session by id
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

// Get admins/members from a session id
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

// Get polls from a session
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

// Get questions from a session
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
