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

import type { Coord } from '../models/Group';

const db = (): Repository<Group> => getConnectionManager().get().getRepository(Group);

/** Contains all group codes used mapped to group id */
const groupCodes = {};

/**
 * Creates a group and saves it to the db
 * @function
 * @param {string} name - Name of group
 * @param {string} code - Unique code used to join group
 * @param {User} [user] - Admin of group
 * @param {?Coord} location - Location of group admin
 * @return {Group} Created group
 */
const createGroup = async (name: string, code: string, user: ?User, location: ?Coord):
  Promise<Group> => {
  try {
    const group = new Group();
    group.name = name;
    group.code = code;
    group.location = location || { lat: null, long: null };
    group.isFilterActivated = true;
    group.isLocationRestricted = false;
    group.admins = user ? [user] : [];

    if (groupCodes[code]) {
      throw LogUtils.logErr(`Group code is already in use: ${code}`);
    }

    await db().persist(group);
    groupCodes[group.code] = group.id;

    return group;
  } catch (e) {
    throw LogUtils.logErr('Problem creating group', e, {
      name, code, user, location,
    });
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
 * @param {string} id - ID of group to fetch
 * @return {?Group} Group with specified id
 */
const getGroupByID = async (id: string): Promise<?Group> => {
  try {
    return await db().createQueryBuilder('groups')
      .where('groups.uuid = :groupID')
      .setParameters({ groupID: id })
      .getOne();
  } catch (e) {
    throw LogUtils.logErr(`Problem getting group by id: ${id}`, e);
  }
};

/**
 * Get a group id by the group's unique code
 * @function
 * @param {string} code - Unique code of group to fetch
 * @return {?string} ID of group with given code
 */
const getGroupID = async (code: string) => {
  const group = await db().createQueryBuilder('groups')
    .where('groups.code = :groupCode')
    .setParameters({ groupCode: code })
    .getOne();
  return group ? group.uuid : null;
};

/**
 * Delete a group
 * @function
 * @param {string} id - ID of group to delete
 */
const deleteGroupByID = async (id: string) => {
  try {
    const group = await getGroupByID(id);
    
    if (group) {
      delete groupCodes[group.code];
      await db().remove(group);
    }
  } catch (e) {
    throw LogUtils.logErr(`Problem deleting group by id: ${id}`, e);
  }
};

/**
 * Update a group by group ID
 * @function
 * @param {string} id - ID of group to update
 * @param {?name} name - New group name
 * @param {?Coord} location - Most recent location of the group admin
 * @param {boolean} isRestricted - If joining a group is restricted by location
 * @param {boolean} isActivated - If profanity filter is on
 * @return {?Group} Updated group
 */
const updateGroupByID = async (id: string, name: ?string, location: ?Coord,
  isRestricted: ?boolean, isActivated: ?boolean):
  Promise<?Group> => {
  try {
    const group = await db().createQueryBuilder('groups')
      .leftJoinAndSelect('groups.admins', 'admins')
      .leftJoinAndSelect('groups.members', 'members')
      .leftJoinAndSelect('groups.polls', 'polls')
      .leftJoinAndSelect('groups.questions', 'questions')
      .where('groups.uuid = :groupID', { groupID: id })
      .getOne();

    if (name) group.name = name;
    if (location && location.lat && location.long) group.location = location;
    if (isRestricted !== null && isRestricted !== undefined) group.isLocationRestricted = isRestricted;
    if (isActivated !== null && isActivated !== undefined) group.isFilterActivated = isActivated;
    await db().persist(group);
    return group;
  } catch (e) {
    throw LogUtils.logErr(`Problem updating group's location restriction: ${id}`, e, { isRestricted });
  }
};

/**
 * Check if joining a group is location restricted
 * @param {string} id - ID of group
 * @return {?boolean} If the group is location restricted
 */
const isLocationRestricted = async (id: string): Promise<?boolean> => {
  try {
    const group = await db().createQueryBuilder('groups')
      .where('groups.uuid = :groupID')
      .setParameters({ groupID: id })
      .getOne();
    return group.isLocationRestricted;
  } catch (e) {
    throw LogUtils.logErr(`Problem getting location restriction for group: ${id}`, e);
  }
};

/**
 * Add users (admins or members) to a group
 * @function
 * @param {string} id - ID of group to add users
 * @param {string[]} googleIDs - List of user's google ids to add
 * @param {string} [role] - Specifies whether to add the users as members or admins
 * @return {?Group} Group that users were added to
 */
const addUsersByGoogleIDs = async (id: string, googleIDs: string[],
  role: ?string): Promise<?Group> => {
  try {
    const group = await db().createQueryBuilder('groups')
      .leftJoinAndSelect('groups.admins', 'admins')
      .leftJoinAndSelect('groups.members', 'members')
      .leftJoinAndSelect('groups.polls', 'polls')
      .leftJoinAndSelect('groups.questions', 'questions')
      .where('groups.uuid = :groupID')
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
 * @param {string} id - ID of group to add users
 * @param {string[]} userIDs - List of user ids to add
 * @param {string} [role] - Specifies whether to add the users as members or admins
 * @return {?Group} Group that users were added to
 */
const addUsersByIDs = async (id: string, userIDs: string[],
  role: ?string): Promise<?Group> => {
  try {
    const group = await db().createQueryBuilder('groups')
      .leftJoinAndSelect('groups.admins', 'admins')
      .leftJoinAndSelect('groups.members', 'members')
      .leftJoinAndSelect('groups.polls', 'polls')
      .leftJoinAndSelect('groups.questions', 'questions')
      .where('groups.uuid = :groupID')
      .setParameters({ groupID: id })
      .getOne();
    if (group) {
      if (role === constants.USER_TYPES.ADMIN) {
        const currAdminIDs = group.admins.map(admin => admin.uuid);
        const admins = await UsersRepo.getUsersFromIDs(userIDs, currAdminIDs);
        group.admins = group.admins.concat(admins);
      } else {
        const currMemberIDs = group.members.map(member => member.uuid);
        const members = await UsersRepo.getUsersFromIDs(userIDs, currMemberIDs);
        group.members = group.members.concat(members);
      }
    }
    await db().persist(group);
    return group;
  } catch (e) {
    console.log(e);
    throw LogUtils.logErr(`Problem adding users to group ${id} by ids`, e, { userIDs, role });
  }
};

/**
 * Remove user from group
 * @function
 * @param {string} id - ID of group to remove user from
 * @param {User} user - User to remove from group
 * @param {string} [role] - Role to remove user from
 * @return {?Group} Group without specified user
 */
const removeUserByGroupID = async (id: string, user: User, role: ?string):
  Promise<?Group> => {
  try {
    const group = await db().createQueryBuilder('groups')
      .leftJoinAndSelect('groups.admins', 'admins')
      .leftJoinAndSelect('groups.members', 'members')
      .leftJoinAndSelect('groups.polls', 'polls')
      .leftJoinAndSelect('groups.questions', 'questions')
      .where('groups.uuid = :groupID')
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
 * @param {string} id - ID of group to check admins
 * @param {User} user - User that we want to check if they're an admin
 * @return {?boolean} Whether the given user is an admin of the given group
 */
const isAdmin = async (id: string, user: User):
  Promise<?boolean> => {
  try {
    const group = await db().createQueryBuilder('groups')
      .leftJoinAndSelect('groups.admins', 'admins')
      .where('groups.uuid = :groupID')
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
 * @param {string} id - ID of group to check members
 * @param {User} user - User that we want to check if they're a member
 * @return {?boolean} Whether the given user is a member of the given group
 */
const isMember = async (id: string, user: User):
  Promise<?boolean> => {
  try {
    const group = await db().createQueryBuilder('groups')
      .leftJoinAndSelect('groups.members', 'members')
      .where('groups.uuid = :groupID')
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
 * @param {string} id - ID of group to get users
 * @param {string} [role] - Specifies if we only want users of a certain role
 * @return {User[]} List of specified user from group
 */
const getUsersByGroupID = async (id: string, role: ?string):
  Promise<Array<?User>> => {
  try {
    const group = await db().createQueryBuilder('groups')
      .leftJoinAndSelect('groups.admins', 'admins')
      .leftJoinAndSelect('groups.members', 'members')
      .where('groups.uuid = :groupID')
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
    console.log(e);
    throw LogUtils.logErr(`Problem getting users for group by id: ${id}`, e, { role });
  }
};

/**
 * Gets polls from a group sorted by creation date in ascending order.
 * By default will hide poll results if poll is not shared.
 * @function
 * @param {string} id - ID of group to fetch polls from
 * @param {boolean} hideUnsharedResults - Whether to return unaltered poll results for admins
 * @return {Poll[]} List of polls from group
 */
const getPolls = async (id: string, hideUnsharedResults: ?boolean = true):
  Promise<Array<?Poll>> => {
  try {
    const group = await db().createQueryBuilder('groups')
      .leftJoinAndSelect('groups.polls', 'polls')
      .where('groups.uuid = :groupID')
      .setParameters({ groupID: id })
      .orderBy('polls.createdAt', 'ASC')
      .getOne();

    // obscure poll results if poll not shared
    return group.polls.map((poll) => {
      if (hideUnsharedResults && poll.state !== constants.POLL_STATES.SHARED
        && poll.type === constants.POLL_TYPES.MULTIPLE_CHOICE) {
        poll.answerChoices = poll.answerChoices.map((choice) => {
          delete choice.count;
          return choice;
        });
      }
      return poll;
    });
  } catch (e) {
    throw LogUtils.logErr(`Problem getting polls from group: ${id}`, e);
  }
};

/**
 * Get questions from a group sorted by creation date in ascending order.
 * @function
 * @param {string} id - ID of group to fetch questions from
 * @return {Question[]} List of questions rom group
 */
const getQuestions = async (id: string): Promise<Array<?Question>> => {
  try {
    const group = await db().createQueryBuilder('groups')
      .leftJoinAndSelect('groups.questions', 'questions')
      .where('groups.uuid = :groupID')
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
 * @param {string} id - ID of group to get latest activity
 * @return {string} Time stamp of when the group was last updated
 */
const latestActivityByGroupID = async (id: string): Promise<string> => {
  try {
    const group = await getGroupByID(id);
    if (!group) throw LogUtils.logErr(`Can't find group by id: ${id}`);

    return await getPolls(id).then((polls: Array<?Poll>) => {
      const latestPoll = polls.slice(-1).pop();
      if (polls.length === 0 || !latestPoll) {
        return group.updatedAt;
      }
      return parseInt(group.updatedAt) > parseInt(latestPoll.updatedAt)
        ? group.updatedAt
        : latestPoll.updatedAt;
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
  isLocationRestricted,
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
