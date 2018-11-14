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
            throw LogUtils.logError('Group code is already in use');
        }

        await db().persist(group);
        groupCodes[group.code] = group.id;

        return group;
    } catch (e) {
        throw LogUtils.logError('Problem creating group!');
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
 * @param {number} id - Id of group to fetch
 * @return {?Group} Group with specified id
 */
const getGroupById = async (id: number): Promise<?Group> => {
    try {
        return await db().findOneById(id);
    } catch (e) {
        throw LogUtils.logError(`Problem getting group by id: ${id}!`);
    }
};

/**
 * Get a group id by the group's unique code
 * @function
 * @param {string} code - Unique code of group to fetch
 * @return {?number} Id of group with given code
 */
const getGroupId = async (code: string) => {
    const group = await db().createQueryBuilder('groups')
        .where('groups.code = :groupCode')
        .setParameters({ groupCode: code })
        .getOne();
    return group ? group.id : null;
};

/**
 * Delete a group
 * @function
 * @param {number} id - Id of group to delete
 */
const deleteGroupById = async (id: number) => {
    try {
        const group = await db().findOneById(id);
        delete groupCodes[group.code];

        await db().remove(group);
    } catch (e) {
        throw LogUtils.logError(`Problem deleting group by id: ${id}!`);
    }
};

/**
 * Update a group
 * @function
 * @param {number} id - Id of group to update
 * @param {string} name - New name of group
 * @return {?Group} Updated group
 */
const updateGroupById = async (id: number, name: string):
  Promise<?Group> => {
    try {
        const field = {};
        if (name !== undefined && name !== null) {
            field.name = name;
            await db().createQueryBuilder('groups')
                .where('groups.id = :groupId')
                .setParameters({ groupId: id })
                .update(field)
                .execute();
        }

        return await db().findOneById(id);
    } catch (e) {
        throw LogUtils.logError(`Problem updating group by id: ${id}!`);
    }
};

/**
 * Add users (admins or members) to a group
 * @function
 * @param {number} id - Id of group to add users
 * @param {string[]} googleIds - List of user's google ids to add
 * @param {string} [role] - Specifies whether to add the users as members or admins
 * @return {?Group} Group that users were added to
 */
const addUsersByGoogleIds = async (id: number, googleIds: string[],
    role: ?string): Promise<?Group> => {
    try {
        const group = await db().createQueryBuilder('groups')
            .leftJoinAndSelect('groups.admins', 'admins')
            .leftJoinAndSelect('groups.members', 'members')
            .leftJoinAndSelect('groups.polls', 'polls')
            .leftJoinAndSelect('groups.questions', 'questions')
            .where('groups.id = :groupId')
            .setParameters({ groupId: id })
            .getOne();
        if (group) {
            if (role === constants.USER_TYPES.ADMIN) {
                const currAdminIds = group.admins.map(admin => admin.googleId);
                const users = await UsersRepo
                    .getUsersByGoogleIds(googleIds, currAdminIds);
                group.admins = group.admins.concat(users);
            } else {
                const currMemberIds = group.members.map(user => user.googleId);
                const users = await UsersRepo
                    .getUsersByGoogleIds(googleIds, currMemberIds);
                group.members = group.members.concat(users);
            }
        }

        await db().persist(group);
        return group;
    } catch (e) {
        throw LogUtils.logError('Problem adding users to group by google ids!');
    }
};

/**
 * Add users (admins or members) to a group
 * @function
 * @param {number} id - Id of group to add users
 * @param {number[]} userIds - List of user ids to add
 * @param {string} [role] - Specifies whether to add the users as members or admins
 * @return {?Group} Group that users were added to
 */
const addUsersByIds = async (id: number, userIds: number[],
    role: ?string): Promise<?Group> => {
    try {
        const group = await db().createQueryBuilder('groups')
            .leftJoinAndSelect('groups.admins', 'admins')
            .leftJoinAndSelect('groups.members', 'members')
            .leftJoinAndSelect('groups.polls', 'polls')
            .leftJoinAndSelect('groups.questions', 'questions')
            .where('groups.id = :groupId')
            .setParameters({ groupId: id })
            .getOne();
        if (group) {
            if (role === constants.USER_TYPES.ADMIN) {
                const currAdminIds = group.admins.map(admin => admin.id);
                const admins = await UsersRepo.getUsersFromIds(userIds, currAdminIds);
                group.admins = group.admins.concat(admins);
            } else {
                const currMemberIds = group.members.map(member => member.id);
                const members = await UsersRepo.getUsersFromIds(userIds, currMemberIds);
                group.members = group.members.concat(members);
            }
        }

        await db().persist(group);
        return group;
    } catch (e) {
        throw LogUtils.logError('Problem adding users to group by ids!');
    }
};

/**
 * Remove user from group
 * @function
 * @param {number} id - Id of group to remove user from
 * @param {User} user - User to remove from group
 * @param {string} [role] - Role to remove user from
 * @return {?Group} Group without specified user
 */
const removeUserByGroupId = async (id: number, user: User, role: ?string):
  Promise<?Group> => {
    try {
        const group = await db().createQueryBuilder('groups')
            .leftJoinAndSelect('groups.admins', 'admins')
            .leftJoinAndSelect('groups.members', 'members')
            .leftJoinAndSelect('groups.polls', 'polls')
            .leftJoinAndSelect('groups.questions', 'questions')
            .where('groups.id = :groupId')
            .setParameters({ groupId: id })
            .getOne();
        if (user) {
            if (role === constants.USER_TYPES.ADMIN) {
                group.admins = group.admins.filter(admin => admin.googleId !== user.googleId);
            } else {
                group.members = group.members
                    .filter(member => member.googleId !== user.googleId);
            }
            await db().persist(group);
        }

        return group;
    } catch (e) {
        throw LogUtils.logError(`Problem removing admin from group by id: ${id}`);
    }
};

/**
 * Checks if user is an admin of given group
 * @function
 * @param {number} id - Id of group to check admins
 * @param {User} user - User that we want to check if they're an admin
 * @return {?boolean} Whether the given user is an admin of the given group
 */
const isAdmin = async (id: number, user: User):
  Promise<?boolean> => {
    try {
        const group = await db().createQueryBuilder('groups')
            .leftJoinAndSelect('groups.admins', 'admins')
            .where('groups.id = :groupId')
            .setParameters({ groupId: id })
            .getOne();

        const admin = group.admins.find(x => x.googleId === user.googleId);
        return admin !== undefined;
    } catch (e) {
        throw LogUtils.logError(`Problem verifying admin status for group ${id}`);
    }
};

/**
 * Checks if user is a member of given group
 * @function
 * @param {number} id - Id of group to check members
 * @param {User} user - User that we want to check if they're a member
 * @return {?boolean} Whether the given user is a member of the given group
 */
const isMember = async (id: number, user: User):
  Promise<?boolean> => {
    try {
        const group = await db().createQueryBuilder('groups')
            .leftJoinAndSelect('groups.members', 'members')
            .where('groups.id = :groupId')
            .setParameters({ groupId: id })
            .getOne();

        const member = group.members.find(x => x.googleId === user.googleId);
        return member !== undefined;
    } catch (e) {
        throw LogUtils.logError(`Problem verifying member status for group ${id}`);
    }
};

/**
 * Get users from a group
 * @function
 * @param {number} id - Id of group to get users
 * @param {string} [role] - Specifies if we only want users of a certain role
 * @return {User[]} List of specified user from group
 */
const getUsersByGroupId = async (id: number, role: ?string):
  Promise<Array<?User>> => {
    try {
        const group = await db().createQueryBuilder('groups')
            .leftJoinAndSelect('groups.admins', 'admins')
            .leftJoinAndSelect('groups.members', 'members')
            .where('groups.id = :groupId')
            .setParameters({ groupId: id })
            .getOne();
        if (role === constants.USER_TYPES.ADMIN) {
            return group.admins;
        } if (role === constants.USER_TYPES.MEMBER) {
            return group.members;
        }
        return group.admins.concat(group.members);
    } catch (e) {
        throw LogUtils.logError(`Problem getting admins for group with id: ${id}!`);
    }
};

/**
 * Gets polls from a group sorted by creation date desc.
 * @function
 * @param {number} id - Id of group to fetch polls from
 * @param {boolean} sharedOnly - Specifies if we only want shared polls or all polls
 * @return {Poll[]} List of polls from group
 */
const getPolls = async (id: number, sharedOnly: boolean):
  Promise<Array<?Poll>> => {
    try {
        const group = await db().createQueryBuilder('groups')
            .leftJoinAndSelect('groups.polls', 'polls')
            .where('groups.id = :groupId')
            .setParameters({ groupId: id })
            .orderBy('polls.createdAt', 'DESC')
            .getOne();

        return sharedOnly === true ? group.polls.filter(poll => poll.shared) : group.polls;
    } catch (e) {
        throw LogUtils.logError('Problem getting polls');
    }
};

/**
 * Get questions from a group sorted by creation date desc.
 * @function
 * @param {number} id - Id of group to fetch questions from
 * @return {Question[]} List of questions rom group
 */
const getQuestions = async (id: number): Promise<Array<?Question>> => {
    try {
        const group = await db().createQueryBuilder('groups')
            .leftJoinAndSelect('groups.questions', 'questions')
            .where('groups.id = :groupId')
            .setParameters({ groupId: id })
            .orderBy('questions.createdAt', 'DESC')
            .getOne();
        return group.questions;
    } catch (e) {
        throw LogUtils.logError('Problem getting questions');
    }
};

/**
 * Get time of latest activity of a group
 * @function
 * @param {number} id - Id of group to get latest activity
 * @return {number} Time stamp of when the group was last updated
 */
const latestActivityByGroupId = async (id: number): Promise<?number> => {
    try {
        const group = await db().findOneById(id);
        if (!group) throw LogUtils.logError(`Can't find group with id ${id}!`);

        return await getPolls(id, false).then((p: Array<?Poll>) => {
            const lastPoll = p.slice(-1).pop();
            if (p.length === 0 || !lastPoll) {
                return group.updatedAt;
            }
            return group.updatedAt > lastPoll.updatedAt ? group.updatedAt : lastPoll.updatedAt;
        });
    } catch (e) {
        throw LogUtils.logError('Problem getting latest activity');
    }
};

export default {
    groupCodes,
    createGroup,
    createCode,
    getGroupById,
    getGroupId,
    updateGroupById,
    deleteGroupById,
    addUsersByGoogleIds,
    removeUserByGroupId,
    getUsersByGroupId,
    isAdmin,
    isMember,
    getPolls,
    getQuestions,
    addUsersByIds,
    latestActivityByGroupId,
};
