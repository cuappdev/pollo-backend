// @flow
import { getConnectionManager, Repository } from 'typeorm';
import LogUtils from '../utils/LogUtils';
import Session from '../models/Session';
import User from '../models/User';
import UserSessionsRepo from './UserSessionsRepo';
import appDevUtils from '../utils/AppDevUtils';
import constants from '../utils/Constants';

const db = (): Repository<User> => getConnectionManager().get().getRepository(User);

/**
 * Creates a dummy user and saves it to the db (Testing purposes)
 * @function
 * @param {string} id - Google id to create user with
 * @return {User} New dummy user
 */
const createDummyUser = async (id: string): Promise<User> => {
    try {
        return await db().persist(User.dummy(id));
    } catch (e) {
        throw LogUtils.logError('Problem creating user!');
    }
};

/**
 * Creates a user using google credentials
 * @function
 * @param {Object} fields - Object containing user info returned by google
 * @return {User} New user created using given credentials
 */
const createUser = async (fields: Object): Promise<User> => {
    try {
        return await db().persist(User.fromGoogleCreds(fields));
    } catch (e) {
        throw LogUtils.logError('Problem creating user!');
    }
};

/**
 * Creates a user
 * @function
 * @param {string} googleId - Google id of user
 * @param {string} firstName - First name of user
 * @param {string} lastName - Last name of user
 * @param {string} email - Email of user
 * @return {User} New user created using given params
 */
const createUserWithFields = async (googleId: string, firstName: string,
    lastName: string, email: string): Promise<User> => {
    try {
        const user = new User();
        user.googleId = googleId;
        user.firstName = firstName;
        user.lastName = lastName;
        user.email = email;
        user.netId = appDevUtils.netIdFromEmail(email);

        await db().persist(user);
        return user;
    } catch (e) {
        throw LogUtils.logError('Problem creating user!');
    }
};

/**
 * Get a user by id
 * @function
 * @param {number} id - Id of user to fetch
 * @return {?User} User with given id
 */
const getUserById = async (id: number): Promise<?User> => {
    try {
        return await db().findOneById(id);
    } catch (e) {
        throw LogUtils.logError(`Problem getting user by id: ${id}!`);
    }
};

/**
 * Get a user by google id
 * @function
 * @param {string} googleId - Google id of user to fetch
 * @return {?User} User with given google id
 */
const getUserByGoogleId = async (googleId: string): Promise<?User> => {
    try {
        return await db().createQueryBuilder('users')
            .where('users.googleId = :googleId', { googleId })
            .getOne();
    } catch (e) {
        throw LogUtils.logError('Problem getting user by google ID!');
    }
};

/**
 * Get all users
 * @function
 * @return {User[]} List of all users
 */
const getUsers = async (): Promise<Array<?User>> => {
    try {
        return await db().createQueryBuilder('users')
            .getMany();
    } catch (e) {
        throw LogUtils.logError('Problem getting users!');
    }
};

/**
 * Gets all users from list of ids but also filters out using another list of ids
 * @function
 * @param {number[]} userIds - List of ids to fetch users from
 * @param {?number[]} filter - List of ids to filter out
 * @return {User[]} List of users resulting from given params
 */
const getUsersFromIds = async (userIds: number[], filter: ?number[]):
Promise<?Array<User>> => {
    try {
        const ids = `(${String(userIds)})`;
        let query = `users.id IN ${ids}`;
        if (filter && filter.length > 0) {
            const f = `(${String(filter)})`;
            query += ` AND users.id not IN ${f}`;
        }
        return await db().createQueryBuilder('users')
            .where(query)
            .getMany();
    } catch (e) {
        throw LogUtils.logError('Problem getting users from ids!');
    }
};

/**
 * Gets all users from list of google ids but also filters out using another
 * list of google ids
 * @function
 * @param {number[]} googleIds - List of google ids to fetch users from
 * @param {?number[]} filter - List of ids to filter out
 * @return {User[]} List of users resulting from given params
 */
const getUsersByGoogleIds = async (googleIds: string[], filter: ?string[]):
  Promise<?Array<User>> => {
    try {
        let validIds = googleIds;
        if (filter && filter.length > 0) {
            validIds = googleIds.filter(id => filter && !filter.includes(id));
        }
        const ids = `{${String(validIds)}}`;
        return await db().createQueryBuilder('users')
            .where(`users.googleId = ANY('${ids}'::text[])`)
            .getMany();
    } catch (e) {
        throw LogUtils.logError('Problem getting users from googleIds!');
    }
};

/**
 * Delete a user
 * @function
 * @param {number} id - Id of user to delete
 */
const deleteUserById = async (id: number) => {
    try {
        const user = await db().findOneById(id);
        await UserSessionsRepo.deleteSessionFromUserId(id);
        await db().remove(user);
    } catch (e) {
        throw LogUtils.logError(`Problem deleting user by id: ${id}!`);
    }
};

/**
 * Gets all sessions that a user is in
 * @function
 * @param {number} id - Id of user to fetch sessions for
 * @param {?string} role - Specifies role which we want to fetch sessions for
 * Ex. If role is admin, we fetch all sessions the user is an admin of.
 * @return {Session[]} List of session for given user
 */
const getSessionsById = async (id: number, role: ?string):
    Promise<Array<?Session>> => {
    try {
        const user = await db().createQueryBuilder('users')
            .leftJoinAndSelect('users.memberSessions', 'memberSessions')
            .leftJoinAndSelect('users.adminSessions', 'adminSessions')
            .where('users.id = :userId')
            .setParameters({ userId: id })
            .getOne();
        if (role === constants.USER_TYPES.ADMIN) {
            return user.adminSessions;
        } if (role === constants.USER_TYPES.MEMBER) {
            return user.memberSessions;
        }
        return user.memberSessions.concat(user.adminSessions);
    } catch (e) {
        throw LogUtils.logError(`Problem getting member sessions for user: ${id}`);
    }
};

export default {
    getUsers,
    createUser,
    createUserWithFields,
    createDummyUser,
    getUserById,
    getUserByGoogleId,
    getUsersByGoogleIds,
    getUsersFromIds,
    deleteUserById,
    getSessionsById,
};
