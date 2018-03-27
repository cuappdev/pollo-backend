// @flow
import { getConnectionManager, Repository } from 'typeorm';
import { Group } from '../models/Group';
import { User } from '../models/User';
import { Session } from '../models/Session';
import appDevUtils from '../utils/appDevUtils';
import SessionsRepo from '../repos/SessionsRepo';
import UsersRepo from './UsersRepo';

const db = (): Repository<Group> => {
  return getConnectionManager().get().getRepository(Group);
};

// Contains all group codes used mapped to group id
var groupCodes = {};

// Create a group
const createGroup = async (name: string, code: string, user: User, session: ?Session,
  members: ?User[]): Promise<Group> => {
  try {
    const group = new Group();
    group.name = name;
    group.code = code;
    group.admins = [user];
    if (members) group.members = members;
    if (session) {
      session = await SessionsRepo.deleteCodeById(session.id);
      group.sessions = [session];
    }

    if (groupCodes[code] || SessionsRepo.sessionCodes[code]) {
      throw new Error('Group code is already in use');
    }
    await db().persist(group);
    groupCodes[group.code] = group.id;

    return group;
  } catch (e) {
    throw new Error('Problem creating group!');
  }
};

// Generate unique group code
const createCode = (): string => {
  var code = appDevUtils.randomCode(6);
  while (groupCodes[code]) {
    code = appDevUtils.randomCode(6);
  }
  return code;
};

// Get a group by Id
const getGroupById = async (id: number): Promise<?Group> => {
  try {
    const group = await db().findOneById(id);
    return group;
  } catch (e) {
    throw new Error(`Problem getting group by id: ${id}!`);
  }
};

// Get a group id from group code
const getGroupIdByCode = async (code: string) => {
  var group =
    await db().createQueryBuilder('groups')
      .where('groups.code = :groupCode')
      .setParameters({ groupCode: code })
      .getOne();
  if (!group) {
    throw new Error(`Could not find session associated with code ${code}`);
  }
  return group.id;
};

// Delete a group by Id
const deleteGroupById = async (id: number) => {
  try {
    const group = await db().findOneById(id);
    if (group.code in groupCodes) {
      delete groupCodes[group.code];
    }
    await db().remove(group);
    await SessionsRepo.deleteSessionsWithOutGroup();
  } catch (e) {
    throw new Error(`Problem deleting group by id: ${id}!`);
  }
};

// Update a group by Id
const updateGroupById = async (id: number, name: ?string):
  Promise<?Group> => {
  try {
    var field = {};
    if (name) field.name = name;
    await db().createQueryBuilder('groups')
      .where('groups.id = :groupId')
      .setParameters({ groupId: id })
      .update(field)
      .execute();
    return await db().findOneById(id);
  } catch (e) {
    throw new Error(`Problem updating group by id: ${id}!`);
  }
};

// Add admin/members to a group by Id
const addUsers = async (id: number, userIds: number[], role: ?string):
  Promise<?Group> => {
  try {
    const group = await db().createQueryBuilder('groups')
      .leftJoinAndSelect('groups.admins', 'admins')
      .leftJoinAndSelect('groups.members', 'members')
      .leftJoinAndSelect('groups.sessions', 'sessions')
      .where('groups.id = :groupId')
      .setParameters({ groupId: id })
      .getOne();

    const users = await UsersRepo.getUsersFromIds(userIds);
    if (users) {
      if (role === 'admin') {
        group.admins = group.admins.concat(users);
      } else {
        group.members = group.members.concat(users);
      }
    }

    await db().persist(group);
    return group;
  } catch (e) {
    throw new Error(`Problem adding users to group by id: ${id}`);
  }
};

// Remove admin/members of a group by Id
const removeUsers = async (id: number, userIds: number[], role: ?string):
  Promise<?Group> => {
  try {
    const group = await db().createQueryBuilder('groups')
      .leftJoinAndSelect('groups.admins', 'admins')
      .leftJoinAndSelect('groups.members', 'members')
      .leftJoinAndSelect('groups.sessions', 'sessions')
      .where('groups.id = :groupId')
      .setParameters({ groupId: id })
      .getOne();
    if (role === 'admin') {
      group.admins = group.admins.filter(function (admin) {
        return !(userIds.includes(admin.id));
      });
    } else {
      group.members = group.members.filter(function (member) {
        return !(userIds.includes(member.id));
      });
    }
    await db().persist(group);
    return group;
  } catch (e) {
    throw new Error(`Problem removing admin from group by id: ${id}`);
  }
};

// Return true if user is an admin of a group by id
const isAdmin = async (id: number, user: User):
    Promise<?boolean> => {
  try {
    const group = await db().createQueryBuilder('groups')
      .leftJoinAndSelect('groups.admins', 'admins')
      .where('groups.id = :groupId')
      .setParameters({ groupId: id })
      .getOne();

    const admins = group.admins;
    for (var i in group.admins) {
      if (admins[i].googleId === user.googleId) {
        return true;
      }
    }
    return false;
  } catch (e) {
    throw new Error(`Problem verifying admin status for group ${id}`);
  }
};

// Get admins/members from a group id
const getUsersByGroupId = async (id: number, role: ?string):
  Promise<Array<?User>> => {
  try {
    const group = await db().createQueryBuilder('groups')
      .leftJoinAndSelect('groups.admins', 'admins')
      .leftJoinAndSelect('groups.members', 'members')
      .where('groups.id = :groupId')
      .setParameters({ groupId: id })
      .getOne();
    if (role === 'admin') {
      return group.admins;
    } else if (role === 'member') {
      return group.members;
    } else {
      return group.admins.concat(group.members);
    }
  } catch (e) {
    throw new Error(`Problem getting admins for group with id: ${id}!`);
  }
};

// Add a session to a group
const addSessionByGroupId = async (id: number, session: Session): Promise<?Group> => {
  try {
    const group = await db().createQueryBuilder('groups')
      .leftJoinAndSelect('groups.admins', 'admins')
      .leftJoinAndSelect('groups.members', 'members')
      .leftJoinAndSelect('groups.sessions', 'sessions')
      .where('groups.id = :groupId')
      .setParameters({ groupId: id })
      .getOne();
    if (session) group.sessions = group.sessions.concat(session);
    await db().persist(group);
    return group;
  } catch (e) {
    throw new Error('Problem adding session to group!');
  }
};

// Remove a session from a group
const removeSessionByGroupId = async (id: number, session: Session): Promise<?Group> => {
  try {
    const group = await db().createQueryBuilder('groups')
      .leftJoinAndSelect('groups.admins', 'admins')
      .leftJoinAndSelect('groups.members', 'members')
      .leftJoinAndSelect('groups.sessions', 'sessions')
      .where('groups.id = :groupId')
      .setParameters({ groupId: id })
      .getOne();
    if (session) {
      group.sessions = group.sessions.filter(function (p) {
        return (p.id !== session.id);
      });
    }
    await db().persist(group);
    return group;
  } catch (e) {
    throw new Error('Problem removing session from group!');
  }
};

// Get sessions from a group id
const getSessionsById = async (id: number): Promise<Array<?Session>> => {
  try {
    const group = await db().createQueryBuilder('groups')
      .leftJoinAndSelect('groups.sessions', 'sessions')
      .where('groups.id = :groupId')
      .setParameters({ groupId: id })
      .getOne();
    return group.sessions;
  } catch (e) {
    throw new Error(`Problem getting sessions for group by id: ${id}`);
  }
};

export default {
  groupCodes,
  createGroup,
  createCode,
  getGroupById,
  getGroupIdByCode,
  updateGroupById,
  deleteGroupById,
  addUsers,
  removeUsers,
  getUsersByGroupId,
  isAdmin,
  addSessionByGroupId,
  removeSessionByGroupId,
  getSessionsById
};
