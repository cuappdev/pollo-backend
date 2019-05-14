// @flow
import { getConnectionManager, Repository } from 'typeorm';
import { LoginTicket } from 'google-auth-library/build/src/auth/loginticket';
import LogUtils from '../utils/LogUtils';
import User from '../models/User';
import UserSession from '../models/UserSession';
import UsersRepo from './UsersRepo';

const db = (): Repository<UserSession> => getConnectionManager().get().getRepository(UserSession);

/**
 * Create or update session for a user
 * @function
 * @param {User} user - User to either create or update a session for
 * @param {?string} accessToken - Access token to be used for the session
 * @param {?string} refreshToken - Refresh token to be used for the session
 * @return {UserSession} New or updated session
 */
const createOrUpdateSession = async (
  user: User, accessToken: ?string, refreshToken: ?string,
): Promise<UserSession> => {
  const optionalSession = await db().createQueryBuilder('usersessions')
    .where('usersessions.user = :userID', { userID: user.id })
    .innerJoinAndSelect('usersessions.user', 'users')
    .getOne();

  let session;
  if (optionalSession) {
    session = await
    db().persist(optionalSession.update(accessToken, refreshToken));
    return session;
  }
  session = await
  db().persist(UserSession.fromUser(user, accessToken, refreshToken));
  return session;
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
    .where('usersessions.sessionToken = :accessToken',
      { accessToken })
    .getOne();
  return session ? session.user : null;
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
  await db().persist(session);
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
    .where('usersessions.sessionToken = :accessToken',
      { accessToken })
    .getOne();
  if (!session) return false;
  return session.isActive
    && session.expiresAt > Math.floor(new Date().getTime() / 1000);
};

/**
 * Delete a session
 * @function
 * @param {string} id - ID of session to delete
 */
const deleteSession = async (id: string) => {
  try {
    const session = await db().createQueryBuilder('usersessions')
      .where('usersessions.uuid = :sessionID')
      .setParameters({ sessionID: id })
      .getOne();
    if (session) await db().remove(session);
  } catch (e) {
    throw LogUtils.logErr(`Problem deleting session by id: ${id}`, e);
  }
};

/**
 * Delete the session for a user
 * @function
 * @param {string} userID - ID of use to delete the session for
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

/**
 * Creates a user if one doesn't exist and then initializes a session for them
 * @function
 * @param {LoginTicket} login - login object supplied by Google
 * @return {Object} Object containing session information for the user.
 */
const createUserAndInitializeSession = async (login: LoginTicket): Promise<Object> => {
  const payload = login.getPayload();
  const googleID = payload.sub;
  const first = payload.given_name;
  const last = payload.family_name;
  const { email } = payload;

  let user = await UsersRepo.getUserByGoogleID(googleID);
  if (!user) {
    user = await UsersRepo.createUserWithFields(googleID, first, last, email);
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
