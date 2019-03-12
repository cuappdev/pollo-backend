// @flow
import { getConnectionManager, Repository } from 'typeorm';
import LogUtils from '../utils/LogUtils';
import Poll from '../models/Poll';
import Question from '../models/Question';
import Group from '../models/Group';
import User from '../models/User';
import appDevUtils from '../utils/AppDevUtils';
import constants from '../utils/Constants';
import UsersRepo from './UsersRepo';

const db = (): Repository<Group> => getConnectionManager().get().getRepository(Group);

/** Contains all group codes used mapped to group id */
const groupCodes = {};

/**
 * Creates a group and saves it to the db
 * @function
 * @param {string} name - Name of group
 * @param {string} code - Unique code used to join group
 * @param {User} [user] - Admin of group
 * @return {Group} Created group
 */
const createGroup = async (name: string, code: string, user: ?User):
  Promise<Group> => {
  try {
    const group = new Group();
    group.name = name;
    group.code = code;
    group.admins = user ? [user] : [];

    if (groupCodes[code]) {
      throw LogUtils.logErr(`Group code is already in use: ${code}`);
    }

    await db().persist(group);
    groupCodes[group.code] = group.id;

    return group;
  } catch (e) {
    throw LogUtils.logErr('Problem creating group', e, { name, code, user });
  }
};

/**
 * Generates a unique group code
 * @function
 * @return {string} Unique code
 */
const createCode = (): string => {
  let code;
  do {
    code = appDevUtils.randomCode(6);
  } while (groupCodes[code]);

  return code;
};

/**
 * Get a group by id
 * @function
 * @param {number} id - ID of group to fetch
 * @return {?Group} Group with specified id
 */
const getGroupByID = async (id: number): Promise<?Group> => {
  try {
    return await db().findOneById(id);
  } catch (e) {
    throw LogUtils.logErr(`Problem getting group by id: ${id}`, e);
  }
};

/**
 * Get a group id by the group's unique code
 * @function
 * @param {string} code - Unique code of group to fetch
 * @return {?number} ID of group with given code
 */
const getGroupID = async (code: string) => {
  const group = await db().createQueryBuilder('groups')
    .where('groups.code = :groupCode')
    .setParameters({ groupCode: code })
    .getOne();
  return group ? group.id : null;
};

/**
 * Delete a group
 * @function
 * @param {number} id - ID of group to delete
 */
const deleteGroupByID = async (id: number) => {
  try {
    const group = await db().findOneById(id);
    delete groupCodes[group.code];
    await db().remove(group);
  } catch (e) {
    throw LogUtils.logErr(`Problem deleting group by id: ${id}`, e);
  }
};

/**
 * Update a group
 * @function
 * @param {number} id - ID of group to update
 * @param {string} name - New name of group
 * @return {?Group} Updated group
 */
const updateGroupByID = async (id: number, name: string):
  Promise<?Group> => {
  try {
    const field = {};
    if (name !== undefined && name !== null) {
      field.name = name;
      await db().createQueryBuilder('groups')
        .where('groups.id = :groupID')
        .setParameters({ groupID: id })
        .update(field)
        .execute();
    }
    return await db().findOneById(id);
  } catch (e) {
    throw LogUtils.logErr(`Problem updating group by id: ${id}`, e, { name });
  }
};

/**
 * Add users (admins or members) to a group
 * @function
 * @param {number} id - ID of group to add users
 * @param {string[]} googleIDs - List of user's google ids to add
 * @param {string} [role] - Specifies whether to add the users as members or admins
 * @return {?Group} Group that users were added to
 */
const addUsersByGoogleIDs = async (id: number, googleIDs: string[],
  role: ?string): Promise<?Group> => {
  try {
    const group = await db().createQueryBuilder('groups')
      .leftJoinAndSelect('groups.admins', 'admins')
      .leftJoinAndSelect('groups.members', 'members')
      .leftJoinAndSelect('groups.polls', 'polls')
      .leftJoinAndSelect('groups.questions', 'questions')
      .where('groups.id = :groupID')
      .setParameters({ groupID: id })
      .getOne();
    if (group) {
      if (role === constants.USER_TYPES.ADMIN) {
        const currAdminIDs = group.admins.map(admin => admin.googleID);
        const users = await UsersRepo
          .getUsersByGoogleIDs(googleIDs, currAdminIDs);
        group.admins = group.admins.concat(users);
      } else {
        const currMemberIDs = group.members.map(user => user.googleID);
        const users = await UsersRepo
          .getUsersByGoogleIDs(googleIDs, currMemberIDs);
        group.members = group.members.concat(users);
      }
    }
    await db().persist(group);
    return group;
  } catch (e) {
    throw LogUtils.logErr(`Problem adding users to group ${id} by google ids`, e, { googleIDs, role });
  }
};

/**
 * Add users (admins or members) to a group
 * @function
 * @param {number} id - ID of group to add users
 * @param {number[]} userIDs - List of user ids to add
 * @param {string} [role] - Specifies whether to add the users as members or admins
 * @return {?Group} Group that users were added to
 */
const addUsersByIDs = async (id: number, userIDs: number[],
  role: ?string): Promise<?Group> => {
  try {
    const group = await db().createQueryBuilder('groups')
      .leftJoinAndSelect('groups.admins', 'admins')
      .leftJoinAndSelect('groups.members', 'members')
      .leftJoinAndSelect('groups.polls', 'polls')
      .leftJoinAndSelect('groups.questions', 'questions')
      .where('groups.id = :groupID')
      .setParameters({ groupID: id })
      .getOne();
    if (group) {
      if (role === constants.USER_TYPES.ADMIN) {
        const currAdminIDs = group.admins.map(admin => admin.id);
        const admins = await UsersRepo.getUsersFromIDs(userIDs, currAdminIDs);
        group.admins = group.admins.concat(admins);
      } else {
        const currMemberIDs = group.members.map(member => member.id);
        const members = await UsersRepo.getUsersFromIDs(userIDs, currMemberIDs);
        group.members = group.members.concat(members);
      }
    }
    await db().persist(group);
    return group;
  } catch (e) {
    throw LogUtils.logErr(`Problem adding users to group ${id} by ids`, e, { userIDs, role });
  }
};

/**
 * Remove user from group
 * @function
 * @param {number} id - ID of group to remove user from
 * @param {User} user - User to remove from group
 * @param {string} [role] - Role to remove user from
 * @return {?Group} Group without specified user
 */
const removeUserByGroupID = async (id: number, user: User, role: ?string):
  Promise<?Group> => {
  try {
    const group = await db().createQueryBuilder('groups')
      .leftJoinAndSelect('groups.admins', 'admins')
      .leftJoinAndSelect('groups.members', 'members')
      .leftJoinAndSelect('groups.polls', 'polls')
      .leftJoinAndSelect('groups.questions', 'questions')
      .where('groups.id = :groupID')
      .setParameters({ groupID: id })
      .getOne();
    if (user) {
      if (role === constants.USER_TYPES.ADMIN) {
        group.admins = group.admins.filter(admin => admin.googleID !== user.googleID);
      } else {
        group.members = group.members
          .filter(member => member.googleID !== user.googleID);
      }
      await db().persist(group);
    }

    return group;
  } catch (e) {
    throw LogUtils.logErr(`Problem removing user from group by id: ${id}`, e, { user, role });
  }
};

/**
 * Checks if user is an admin of given group
 * @function
 * @param {number} id - ID of group to check admins
 * @param {User} user - User that we want to check if they're an admin
 * @return {?boolean} Whether the given user is an admin of the given group
 */
const isAdmin = async (id: number, user: User):
  Promise<?boolean> => {
  try {
    const group = await db().createQueryBuilder('groups')
      .leftJoinAndSelect('groups.admins', 'admins')
      .where('groups.id = :groupID')
      .setParameters({ groupID: id })
      .getOne();

    const admin = group.admins.find(x => x.googleID === user.googleID);
    return admin !== undefined;
  } catch (e) {
    throw LogUtils.logErr(`Problem verifying admin status for group: ${id}`, e, { user });
  }
};

/**
 * Checks if user is a member of given group
 * @function
 * @param {number} id - ID of group to check members
 * @param {User} user - User that we want to check if they're a member
 * @return {?boolean} Whether the given user is a member of the given group
 */
const isMember = async (id: number, user: User):
  Promise<?boolean> => {
  try {
    const group = await db().createQueryBuilder('groups')
      .leftJoinAndSelect('groups.members', 'members')
      .where('groups.id = :groupID')
      .setParameters({ groupID: id })
      .getOne();

    const member = group.members.find(x => x.googleID === user.googleID);
    return member !== undefined;
  } catch (e) {
    throw LogUtils.logErr(`Problem verifying member status for group: ${id}`, e, { user });
  }
};

/**
 * Get users from a group
 * @function
 * @param {number} id - ID of group to get users
 * @param {string} [role] - Specifies if we only want users of a certain role
 * @return {User[]} List of specified user from group
 */
const getUsersByGroupID = async (id: number, role: ?string):
  Promise<Array<?User>> => {
  try {
    const group = await db().createQueryBuilder('groups')
      .leftJoinAndSelect('groups.admins', 'admins')
      .leftJoinAndSelect('groups.members', 'members')
      .where('groups.id = :groupID')
      .setParameters({ groupID: id })
      .getOne();
    if (role === constants.USER_TYPES.ADMIN) {
      return group.admins;
    }
    if (role === constants.USER_TYPES.MEMBER) {
      return group.members;
    }
    return group.admins.concat(group.members);
  } catch (e) {
    throw LogUtils.logErr(`Problem getting users for group by id: ${id}`, e, { role });
  }
};

/**
 * Gets polls from a group sorted by creation date in ascending order.
 * By default will hide poll results if poll is not shared.
 * @function
 * @param {number} id - ID of group to fetch polls from
 * @param {boolean} hideUnsharedResults - Whether to return unaltered poll results for admins
 * @return {Poll[]} List of polls from group
 */
const getPolls = async (id: number, hideUnsharedResults: ?boolean = true):
  Promise<Array<?Poll>> => {
  try {
    const group = await db().createQueryBuilder('groups')
      .leftJoinAndSelect('groups.polls', 'polls')
      .where('groups.id = :groupID')
      .setParameters({ groupID: id })
      .orderBy('polls.createdAt', 'ASC')
      .getOne();
    // obscure poll results if poll not shared
    return group.polls.map(poll => (hideUnsharedResults && !poll.shared ? { ...poll, results: {} } : poll));
  } catch (e) {
    throw LogUtils.logErr(`Problem getting polls from group: ${id}`, e);
  }
};

/**
 * Get questions from a group sorted by creation date in ascending order.
 * @function
 * @param {number} id - ID of group to fetch questions from
 * @return {Question[]} List of questions rom group
 */
const getQuestions = async (id: number): Promise<Array<?Question>> => {
  try {
    const group = await db().createQueryBuilder('groups')
      .leftJoinAndSelect('groups.questions', 'questions')
      .where('groups.id = :groupID')
      .setParameters({ groupID: id })
      .orderBy('questions.createdAt', 'ASC')
      .getOne();
    return group.questions;
  } catch (e) {
    throw LogUtils.logErr(`Problem getting questions from group: ${id}`, e);
  }
};

/**
 * Get time of latest activity of a group
 * @function
 * @param {number} id - ID of group to get latest activity
 * @return {number} Time stamp of when the group was last updated
 */
const latestActivityByGroupID = async (id: number): Promise<?number> => {
  try {
    const group = await db().findOneById(id);
    if (!group) throw LogUtils.logErr(`Can't find group by id: ${id}`);

    return await getPolls(id).then((polls: Array<?Poll>) => {
      const latestPoll = polls.slice(-1).pop();
      if (polls.length === 0 || !latestPoll) {
        return group.updatedAt;
      }
      return group.updatedAt > latestPoll.updatedAt ? group.updatedAt : latestPoll.updatedAt;
    });
  } catch (e) {
    throw LogUtils.logErr(`Problem getting latest activity from group by id: ${id}`, e);
  }
};

export default {
  groupCodes,
  createGroup,
  createCode,
  deleteGroupByID,
  getGroupByID,
  getGroupID,
  updateGroupByID,
  addUsersByGoogleIDs,
  removeUserByGroupID,
  getUsersByGroupID,
  isAdmin,
  isMember,
  getPolls,
  getQuestions,
  addUsersByIDs,
  latestActivityByGroupID,
};
