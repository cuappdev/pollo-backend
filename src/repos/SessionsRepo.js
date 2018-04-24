// @flow
import { getConnectionManager, Repository } from 'typeorm';
import { Session } from '../models/Session';
import { User } from '../models/User';
import { Poll } from '../models/Poll';
import appDevUtils from '../utils/appDevUtils';
import UsersRepo from './UsersRepo';

const db = (): Repository<Session> => {
  return getConnectionManager().get().getRepository(Session);
};

// Contains all session codes used mapped to session id
var sessionCodes = {};

// Create a session
const createSession = async (name: string, code: string, user: ?User,
  isGroup: boolean):
  Promise<Session> => {
  try {
    const session = new Session();
    session.name = name;
    session.code = code;
    if (isGroup !== null && isGroup !== undefined) {
      session.isGroup = isGroup;
    }
    if (user) {
      session.admins = [user];
    }

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
  var code = appDevUtils.randomCode(6);
  while (sessionCodes[code]) {
    code = appDevUtils.randomCode(6);
  }
  return code;
};

// Get a session by Id
const getSessionById = async (id: number): Promise<?Session> => {
  try {
    const session = await db().findOneById(id);
    return session;
  } catch (e) {
    throw new Error(`Problem getting session by id: ${id}!`);
  }
};

// Get a session id from session code
const getSessionId = async (code: string) => {
  var session =
    await db().createQueryBuilder('sessions')
      .where('sessions.code = :sessionCode')
      .setParameters({ sessionCode: code })
      .getOne();
  if (session) {
    return session.id;
  }
  return null;
};

// Delete a session by Id
const deleteSessionById = async (id: number) => {
  try {
    const session = await db().findOneById(id);
    if (session.code in sessionCodes) {
      delete sessionCodes[session.code];
    }
    // Cascading does work???
    // await PollsRepo.deletePollsForSession(id);
    await db().remove(session);
  } catch (e) {
    throw new Error(`Problem deleting session by id: ${id}!`);
  }
};

// Delete code for a session
const deleteCodeById = async (id: number): Promise<Session> => {
  try {
    const session = await db().findOneById(id);
    if (session.code in sessionCodes) {
      delete sessionCodes[session.code];
    }
    var field = {};
    field.code = '';
    await db().createQueryBuilder('sessions')
      .where('sessions.id = :sessionId')
      .setParameters({ sessionId: id })
      .update(field)
      .execute();
    return await db().findOneById(id);
  } catch (e) {
    throw new Error(`Problem deleting code for session by id: ${id}`);
  }
};

// Update a session by Id
const updateSessionById = async (id: number, name: ?string):
  Promise<?Session> => {
  try {
    var field = {};
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
      .where('sessions.id = :sessionId')
      .setParameters({ sessionId: id })
      .getOne();
    if (session) {
      if (role === 'admin') {
        const currAdminIds = session.admins.map(function (admin) {
          return admin.googleId;
        });
        const users = await UsersRepo
          .getUsersByGoogleIds(googleIds, currAdminIds);
        session.admins = session.admins.concat(users);
      } else {
        const currUserIds = session.members.map(function (user) {
          return user.googleId;
        });
        const users = await UsersRepo
          .getUsersByGoogleIds(googleIds, currUserIds);
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
      .where('sessions.id = :sessionId')
      .setParameters({ sessionId: id })
      .getOne();
    if (session) {
      if (role === 'admin') {
        const currAdminIds = session.admins.map(function (admin) {
          return admin.id;
        });
        const admins = await UsersRepo.getUsersFromIds(userIds, currAdminIds);
        session.admins = session.admins.concat(admins);
      } else {
        const currUserIds = session.members.map(function (user) {
          return user.id;
        });
        const users = await UsersRepo.getUsersFromIds(userIds, currUserIds);
        session.members = session.members.concat(users);
      }
    }

    await db().persist(session);
    return session;
  } catch (e) {
    throw new Error('Problem adding users to session by groupIds!');
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
      .where('sessions.id = :sessionId')
      .setParameters({ sessionId: id })
      .getOne();
    if (user) {
      if (role === 'admin') {
        session.admins = session.admins.filter(function (admin) {
          return (admin.googleId !== user.googleId);
        });
      } else {
        session.members = session.members.filter(function (member) {
          return (member.googleId !== user.googleId);
        });
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

    const admins = session.admins;
    for (var i in admins) {
      if (admins[i].googleId === user.googleId) {
        return true;
      }
    }
    return false;
  } catch (e) {
    throw new Error(`Problem verifying admin status for session ${id}`);
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
    if (role === 'admin') {
      return session.admins;
    } else if (role === 'member') {
      return session.members;
    } else {
      return session.admins.concat(session.members);
    }
  } catch (e) {
    throw new Error(`Problem getting admins for session with id: ${id}!`);
  }
};

// Get polls before a specified date
const getPollsBeforeDate = async (id: number, cursor: ?number):
  Promise<Array<?Poll>> => {
  if (!cursor) cursor = (new Date()).getTime();
  try {
    const session = await db().createQueryBuilder('sessions')
      .leftJoinAndSelect('sessions.polls', 'polls')
      .where('sessions.id = :sessionId')
      .setParameters({ sessionId: id })
      .orderBy('polls.createdAt', 'DESC')
      .getOne();

    return session.polls;
  } catch (e) {
    throw new Error('Problem getting polls before date');
  }
};

export default {
  sessionCodes,
  createSession,
  createCode,
  deleteCodeById,
  getSessionById,
  getSessionId,
  updateSessionById,
  deleteSessionById,
  addUsersByGoogleIds,
  removeUserBySessionId,
  getUsersBySessionId,
  isAdmin,
  getPollsBeforeDate,
  addUsersByIds
};
