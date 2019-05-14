// @flow
import { getConnectionManager, Repository } from 'typeorm';
import LogUtils from '../utils/LogUtils';
import Group from '../models/Group';
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
    console.log(e);
    throw LogUtils.logErr('Problem creating user', e, { id });
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
    throw LogUtils.logErr('Problem creating user from google credentials', e, { fields });
  }
};

/**
 * Creates a user
 * @function
 * @param {string} googleID - Google id of user
 * @param {string} firstName - First name of user
 * @param {string} lastName - Last name of user
 * @param {string} email - Email of user
 * @return {User} New user created using given params
 */
const createUserWithFields = async (googleID: string, firstName: string,
  lastName: string, email: string): Promise<User> => {
  try {
    const user = new User();
    user.googleID = googleID;
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.netID = appDevUtils.netIDFromEmail(email);

    await db().persist(user);
    return user;
  } catch (e) {
    throw LogUtils.logErr('Problem creating user with fields', e, {
      googleID, firstName, lastName, email,
    });
  }
};

/**
 * Get a user by id
 * @function
 * @param {string} id - ID of user to fetch
 * @return {?User} User with given id
 */
const getUserByID = async (id: string): Promise<?User> => {
  try {
    return await db().createQueryBuilder('users')
      .where('users.uuid = :userID')
      .setParameters({ userID: id })
      .getOne();
  } catch (e) {
    throw LogUtils.logErr(`Problem getting user by id: ${id}`, e);
  }
};

/**
 * Get a user by google id
 * @function
 * @param {string} googleID - Google id of user to fetch
 * @return {?User} User with given google id
 */
const getUserByGoogleID = async (googleID: string): Promise<?User> => {
  try {
    return await db().createQueryBuilder('users')
      .where('users.googleID = :googleID', { googleID })
      .getOne();
  } catch (e) {
    throw LogUtils.logErr('Problem getting user by google ID', e, { googleID });
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
    throw LogUtils.logErr('Problem getting users', e);
  }
};

/**
 * Gets all users from list of ids but also filters out using another list of ids
 * @function
 * @param {string[]} userIDs - List of ids to fetch users from
 * @param {?string[]} filter - List of ids to filter out
 * @return {User[]} List of users resulting from given params
 */
const getUsersFromIDs = async (userIDs: string[], filter: ?string[]):
Promise<?Array<User>> => {
  try {
    const strIDs = userIDs.map(str => `'${str}'`).join(',');
    let query = `users.uuid IN (${strIDs})`;
    if (filter && filter.length > 0) {
      const strFilter = filter.map(str => `'${str}'`).join(',');
      query += ` AND users.uuid not IN (${strFilter})`;
    }
    return await db().createQueryBuilder('users')
      .where(query)
      .getMany();
  } catch (e) {
    throw LogUtils.logErr('Problem getting users from ids', e, { userIDs, filter });
  }
};

/**
 * Gets all users from list of google ids but also filters out using another
 * list of google ids
 * @function
 * @param {string[]} googleIDs - List of google ids to fetch users from
 * @param {?string[]} filter - List of ids to filter out
 * @return {User[]} List of users resulting from given params
 */
const getUsersByGoogleIDs = async (googleIDs: string[], filter: ?string[]):
  Promise<?Array<User>> => {
  try {
    let validIDs = googleIDs;
    if (filter && filter.length > 0) {
      validIDs = googleIDs.filter(id => filter && !filter.includes(id));
    }
    const ids = `{${String(validIDs)}}`;
    return await db().createQueryBuilder('users')
      .where(`users.googleID = ANY('${ids}'::text[])`)
      .getMany();
  } catch (e) {
    throw LogUtils.logErr('Problem getting users from googleIDs', e, { googleIDs, filter });
  }
};

/**
 * Delete a user
 * @function
 * @param {string} id - ID of user to delete
 */
const deleteUserByID = async (id: string) => {
  try {
    const user = await getUserByID(id);
    await UserSessionsRepo.deleteSessionFromUserID(id);
    await db().remove(user);
  } catch (e) {
    throw LogUtils.logErr(`Problem deleting user by id: ${id}`, e);
  }
};

/**
 * Gets all groups that a user is in
 * @function
 * @param {string} id - ID of user to fetch groups for
 * @param {?string} role - Specifies role which we want to fetch groups for
 * Ex. If role is admin, we fetch all groups the user is an admin of.
 * @return {Session[]} List of groups for given user
 */
const getGroupsByID = async (id: string, role: ?string):
    Promise<Array<?Group>> => {
  try {
    const user = await db().createQueryBuilder('users')
      .leftJoinAndSelect('users.memberGroups', 'memberGroups')
      .leftJoinAndSelect('users.adminGroups', 'adminGroups')
      .where('users.uuid = :userID')
      .setParameters({ userID: id })
      .getOne();
    if (role === constants.USER_TYPES.ADMIN) {
      return user.adminGroups;
    } if (role === constants.USER_TYPES.MEMBER) {
      return user.memberGroups;
    }
    return user.memberGroups.concat(user.adminGroups);
  } catch (e) {
    throw LogUtils.logErr(`Problem getting member groups for user: ${id}`, e, { role });
  }
};

export default {
  getUsers,
  createUser,
  createUserWithFields,
  createDummyUser,
  getGroupsByID,
  getUserByGoogleID,
  getUserByID,
  getUsersByGoogleIDs,
  getUsersFromIDs,
  deleteUserByID,
};
