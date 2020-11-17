// @flow
import { getRepository, Repository } from 'typeorm';
import UserSessionsRepo from './UserSessionsRepo';
import Group from '../models/Group';
import User from '../models/User';
import appDevUtils from '../utils/AppDevUtils';
import constants from '../utils/Constants';
import LogUtils from '../utils/LogUtils';

const db = (): Repository<User> => getRepository(User);

/**
 * Creates a dummy user and saves it to the db (Testing purposes)
 * @function
 * @param {string} email - email to create user with
 * @return {User} New dummy user
 */
const createDummyUser = async (email: string): Promise<User> => {
  try {
    return await db().save(User.dummy(email));
  } catch (e) {
    console.log(e);
    throw LogUtils.logErr('Problem creating user', e, { id });
  }
};

/**
 * Creates a user
 * @function
 * @param {string} firstName - First name of user
 * @param {string} lastName - Last name of user
 * @param {string} email - Email of user
 * @return {User} New user created using given params
 */
const createUserWithFields = async (
  firstName: string,
  lastName: string,
  email: string,
): Promise<User> => {
  try {
    const user = new User();
    user.googleID = 'googleID';
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.netID = appDevUtils.netIDFromEmail(email);
    user.adminGroups = [];
    user.memberGroups = [];
    user.drafts = [];
    await db().save(user);
    return user;
  } catch (e) {
    throw LogUtils.logErr('Problem creating user with fields', e, {
      firstName,
      lastName,
      email,
    });
  }
};

/**
 * Get a user by UUID
 * @function
 * @param {string} id - UUID of user to fetch
 * @return {?User} User with given id
 */
const getUserByID = async (id: string): Promise<?User> => {
  try {
    return await db().createQueryBuilder('users')
      .where('users.uuid = :userID')
      .setParameters({ userID: id })
      .getOne();
  } catch (e) {
    throw LogUtils.logErr(`Problem getting user by UUID: ${id}`, e);
  }
};

/**
 * Get a user by email
 * @function
 * @param {string} email - email of user to fetch
 * @return {?User} User with given email
 */
const getUserByEmail = async (email: string): Promise<?User> => {
  try {
    return await db().createQueryBuilder('users')
      .where('users.email = :email', { email })
      .getOne();
  } catch (e) {
    throw LogUtils.logErr('Problem getting user by email', e, { email });
  }
};

/**
 * Get all users
 * @function
 * @return {User[]} List of all users
 */
const getUsers = async (): Promise<Array<?User>> => {
  try {
    return await db().createQueryBuilder('users').getMany();
  } catch (e) {
    throw LogUtils.logErr('Problem getting users', e);
  }
};

/**
 * Gets all users from list of UUIDs but also filters out using another list of UUIDs
 * @function
 * @param {string[]} userIDs - List of UUIDs to fetch users from
 * @param {?string[]} filter - List of UUIDs to filter out
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
    throw LogUtils.logErr('Problem getting users from UUIDs', e, { userIDs, filter });
  }
};

/**
 * Delete a user by UUID
 * @function
 * @param {string} id - UUID of user to delete
 */
const deleteUserByID = async (id: string) => {
  try {
    const user = await getUserByID(id);
    await UserSessionsRepo.deleteSessionFromUserID(id);
    await db().remove(user);
  } catch (e) {
    throw LogUtils.logErr(`Problem deleting user by UUID: ${id}`, e);
  }
};

/**
 * Gets all groups that a user is in
 * @function
 * @param {string} id - UUID of user to fetch groups for
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
    }
    if (role === constants.USER_TYPES.MEMBER) {
      return user.memberGroups;
    }
    return user.memberGroups.concat(user.adminGroups);
  } catch (e) {
    throw LogUtils.logErr(`Problem getting member groups for user: ${id}`, e, { role });
  }
};

export default {
  getUsers,
  createUserWithFields,
  createDummyUser,
  getGroupsByID,
  getUserByID,
  getUserByEmail,
  getUsersFromIDs,
  deleteUserByID,
};
