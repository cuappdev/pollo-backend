// @flow
import { getConnectionManager, Repository } from 'typeorm';
import User from '../models/User';
import UserSession from '../models/UserSession';

const db = (): Repository<UserSession> => getConnectionManager().get().getRepository(UserSession);

// Create or update session
const createOrUpdateSession = async (
    user: User, accessToken: ?string, refreshToken: ?string,
): Promise<UserSession> => {
    const optionalSession = await db().createQueryBuilder('usersessions')
        .where('usersessions.user = :userId', { userId: user.id })
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

// Get user from access token
const getUserFromToken = async (accessToken: string): Promise<?User> => {
    const session = await db().createQueryBuilder('usersessions')
        .leftJoinAndSelect('usersessions.user', 'user')
        .where('usersessions.sessionToken = :accessToken',
            { accessToken })
        .getOne();
    return session ? session.user : null;
};

// Update session from refresh token
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

// Make sure access token is related to active, valid session
const verifySession = async (accessToken: string): Promise<boolean> => {
    const session = await db().createQueryBuilder('usersessions')
        .where('usersessions.sessionToken = :accessToken',
            { accessToken })
        .getOne();
    if (!session) return false;
    return session.isActive
    && session.expiresAt > Math.floor(new Date().getTime() / 1000);
};

// Delete session
const deleteSession = async (id: number) => {
    try {
        const session = await db().findOneById(id);
        await db().remove(session);
    } catch (e) {
        throw new Error(`Problem deleting session by id: ${id}!`);
    }
};

const deleteSessionFromUserId = async (userId: number) => {
    try {
        const session = await db().createQueryBuilder('usersessions')
            .innerJoin('usersessions.user', 'user', 'user.id = :userId')
            .setParameters({ userId })
            .getOne();
        if (session) db().remove(session);
    } catch (e) {
        throw new Error('Problem deleting session!');
    }
};

export default {
    createOrUpdateSession,
    getUserFromToken,
    updateSession,
    verifySession,
    deleteSession,
    deleteSessionFromUserId,
};
