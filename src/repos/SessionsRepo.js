// @flow
import { getConnectionManager, Repository } from 'typeorm';
import { Session } from '../models/Session';
import { User } from '../models/User';

const db = (): Repository<Session> => {
  return getConnectionManager().get().getRepository(Session);
};

// Create or update session
const createOrUpdateSession = async (
  user: User, accessToken: ?string, refreshToken: ?string
): Promise<Session> => {
  const optionalSession = await db().createQueryBuilder('sessions')
    .where('sessions.user = :userId', { userId: user.id })
    .innerJoinAndSelect('sessions.user', 'users')
    .getOne();

  var session;
  if (optionalSession) {
    session = await
      db().persist(optionalSession.update(accessToken, refreshToken));
    return session;
  }
  session = await
    db().persist(Session.fromUser(user, accessToken, refreshToken));
  return session;
};

// Get user from access token
const getUserFromToken = async (accessToken: string): Promise<?User> => {
  const session = await db().createQueryBuilder('sessions')
    .leftJoinAndSelect('sessions.user', 'user')
    .where('sessions.sessionToken = :accessToken', {accessToken: accessToken})
    .getOne();

  return session.user;
};

// Make sure access token is related to active, valid session
const verifySession = async (accessToken: string): Promise<boolean> => {
  const session = await db().createQueryBuilder('sessions')
    .where('sessions.sessionToken = :accessToken', {accessToken: accessToken})
    .getOne();
  if (!session) return false;
  return session.expiresAt > Math.floor(new Date().getTime() / 1000);
};

export default {
  createOrUpdateSession,
  getUserFromToken,
  verifySession
};
