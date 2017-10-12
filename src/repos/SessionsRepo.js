// @flow
import { getConnectionManager, Repository } from 'typeorm';
import { Session } from '../models/Session';
import { User } from '../models/User';

const db = (): Repository<Session> => {
  return getConnectionManager().get().getRepository(Session);
};

// Create or update session
const createOrUpdateSession = async (
  user: User
): Promise<Session> => {
  const optionalSession = await db().createQueryBuilder('sessions')
    .where('sessions.user = :userId', { userId: user.id })
    .innerJoinAndSelect('sessions.user', 'users')
    .getOne();

  if (optionalSession) {
    return db().persist(optionalSession.update());
  }
  return db().persist(Session.fromUser(user));
};

export default {
  createOrUpdateSession
};
