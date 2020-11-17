// @flow
import { getRepository, Repository } from 'typeorm';
import { LoginTicket } from 'google-auth-library/build/src/auth/loginticket';
import UsersRepo from './UsersRepo';
import User from '../models/User';
import UserSession from '../models/UserSession';
import LogUtils from '../utils/LogUtils';

const db = (): Repository<UserSession> => getRepository(UserSession);

/**
 * Create or update session for a user
 * @function
 * @param {User} user - User to either create or update a session for
 * @param {?string} accessToken - Access token to be used for the session
 * @param {?string} refreshToken - Refresh token to be used for the session
 * @return {UserSession} New or updated session
 */
const createOrUpdateSession = async (
  user: User,
  accessToken: ?string,
  refreshToken: ?string,
): Promise<UserSession> => {
  let session = await db().createQueryBuilder('usersessions')
    .innerJoin('usersessions.user', 'user', 'user.uuid = :userID')
    .setParameters({ userID: user.uuid })
    .getOne();
  if (session) {
    session.update(accessToken, refreshToken);
    session.user = user;
  } else {
    session = UserSession.fromUser(user, accessToken, refreshToken);
  }
  return db().save(session);
};

/**
 * Get user from access token
 * @function
 * @param {string} accessToken - Access token that we want to find the owner
 * @return {?User} User that is associated with the access token
 */
const getUserFromToken = async (accessToken: string): Promise<?User> => {
  const session = await db().createQueryBuilder('usersessions')
    .leftJoinAndSelect('usersessions.user', 'user')
    .where('usersessions.sessionToken = :accessToken', { accessToken })
    .getOne();
  if (session && session.isActive && session.expiresAt > Math.floor(new Date().getTime() / 1000)) {
    return session.user;
  }
  return null;
  // throw Error('No valid session');
};

/**
 * Update a session
 * @function
 * @param {string} refreshToken - Refresh token associated with session to update
 * @return {Object} Object containing the session info serialized
 */
const updateSession = async (refreshToken: string): Promise<?Object> => {
  let session = await db().createQueryBuilder('usersessions')
    .leftJoinAndSelect('usersessions.user', 'user')
    .where('usersessions.updateToken = :token', { token: refreshToken })
    .getOne();
  if (!session) return null;
  session = session.update();
  await db().save(session);
  return {
    accessToken: session.sessionToken,
    refreshToken: session.updateToken,
    sessionExpiration: session.expiresAt,
    isActive: session.isActive,
  };
};

/**
 * Verify that a session if valid and active
 * @function
 * @param {string} accessToken - Access token associated with session to check
 * @return {boolean} Whether or not the session is valid and active
 */
const verifySession = async (accessToken: string): Promise<boolean> => {
  const session = await db().createQueryBuilder('usersessions')
    .where('usersessions.sessionToken = :accessToken', { accessToken })
    .getOne();
  return session
    ? session.isActive && session.expiresAt > Math.floor(new Date().getTime() / 1000)
    : false;
};

/**
 * Delete a session
 * @function
 * @param {string} id - UUID of session to delete
 */
const deleteSession = async (id: string) => {
  try {
    const session = await db().createQueryBuilder('usersessions')
      .where('usersessions.uuid = :sessionID')
      .setParameters({ sessionID: id })
      .getOne();
    if (session) await db().remove(session);
  } catch (e) {
    throw LogUtils.logErr(`Problem deleting session by UUID: ${id}`, e);
  }
};

/**
 * Delete the session for a user
 * @function
 * @param {string} userID - UUID of user to delete the session for
 */
const deleteSessionFromUserID = async (userID: string) => {
  try {
    const session = await db().createQueryBuilder('usersessions')
      .innerJoin('usersessions.user', 'user', 'user.uuid = :userID')
      .setParameters({ userID })
      .getOne();
    if (session) await db().remove(session);
  } catch (e) {
    throw LogUtils.logErr(`Problem deleting session by user: ${userID}`, e);
  }
};

// /**
//  * Creates a user if one doesn't exist and then initializes a session for them
//  * @function
//  * @param {LoginTicket} login - login object supplied by Google
//  * @return {Object} Object containing session information for the user.
//  */
// const createUserAndInitializeSession = async (login: LoginTicket): Promise<Object> => {
//   const {
//     sub: googleID,
//     given_name: first,
//     family_name: last,
//     email,
//   } = login.getPayload();
//   let user = await UsersRepo.getUserByGoogleID(googleID);
//   if (!user) {
//     user = await UsersRepo.createUserWithFields(googleID, first, last, email);
//   }
//   const session = await createOrUpdateSession(user, null, null);
//   return session.serialize();
// };

/**
 * Creates a user if one doesn't exist and then initializes a session for them
 * @function
 * @param {LoginTicket} login - login object supplied by Google
 * @return {Object} Object containing session information for the user.
 */
const createUserAndInitializeSession = async (first: string, last: string, email: string): Promise<Object> => {
  // const {
  //   sub: googleID,
  //   given_name: first,
  //   family_name: last,
  //   email,
  // } = login.getPayload();
  let user = await UsersRepo.getUserByEmail(email);
  if (!user) {
    user = await UsersRepo.createUserWithFields(first, last, email);
  }
  const session = await createOrUpdateSession(user, null, null);
  return session.serialize();
};

export default {
  createOrUpdateSession,
  getUserFromToken,
  updateSession,
  verifySession,
  deleteSession,
  deleteSessionFromUserID,
  createUserAndInitializeSession,
};
