// @flow
import { getConnectionManager, Repository } from 'typeorm';
import LogUtils from '../utils/LogUtils';
import User from '../models/User';
import UserSession from '../models/UserSession';

const db = (): Repository<UserSession> => getConnectionManager().get().getRepository(UserSession);

/**
 * Create or update session for a user
 * @function
 * @param {User} user - User to either create or update a sessionn for
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
 * @param {number} id - ID of session to delete
 */
const deleteSession = async (id: number) => {
    try {
        const session = await db().findOneById(id);
        await db().remove(session);
    } catch (e) {
        throw LogUtils.logError(`Problem deleting session by id: ${id}!`);
    }
};

/**
 * Delete the session for a user
 * @function
 * @param {number} userID - ID of use to delete the session for
 */
const deleteSessionFromUserID = async (userID: number) => {
    try {
        const session = await db().createQueryBuilder('usersessions')
            .innerJoin('usersessions.user', 'user', 'user.id = :userID')
            .setParameters({ userID })
            .getOne();
        if (session) db().remove(session);
    } catch (e) {
        throw LogUtils.logError('Problem deleting session!');
    }
};

export default {
    createOrUpdateSession,
    getUserFromToken,
    updateSession,
    verifySession,
    deleteSession,
    deleteSessionFromUserID,
};
