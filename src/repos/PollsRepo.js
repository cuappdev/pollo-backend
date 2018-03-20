// @flow
import { getConnectionManager, Repository } from 'typeorm';
import { Poll } from '../models/Poll';
import { User } from '../models/User';
import { Group } from '../models/Group';
import appDevUtils from '../utils/appDevUtils';
import QuestionsRepo from '../repos/QuestionsRepo';
import GroupsRepo from './GroupsRepo';

const db = (): Repository<Poll> => {
  return getConnectionManager().get().getRepository(Poll);
};

// Contains all poll codes used mapped to poll id
var pollCodes = {};

// Create a poll
const createPoll = async (name: string, code: string, user: User,
  group: ?Group):
  Promise<Poll> => {
  try {
    const poll = new Poll();
    poll.name = name;
    poll.code = code;
    poll.admins = [user];
    if (group) poll.group = group;

    if (pollCodes[code] || GroupsRepo.groupCodes[code]) {
      throw new Error('Poll code is already in use');
    }

    await db().persist(poll);
    pollCodes[poll.code] = poll.id;

    return poll;
  } catch (e) {
    throw new Error('Problem creating poll!');
  }
};

// Generate unique poll code
const createCode = (): string => {
  var code = appDevUtils.randomCode(6);
  while (pollCodes[code]) {
    code = appDevUtils.randomCode(6);
  }
  return code;
};

// Get a poll by Id
const getPollById = async (id: number): Promise<?Poll> => {
  try {
    const poll = await db().findOneById(id);
    return poll;
  } catch (e) {
    throw new Error(`Problem getting poll by id: ${id}!`);
  }
};

// Get a poll id from poll code
const getPollId = async (code: string) => {
  var poll =
    await db().createQueryBuilder('polls')
      .where('polls.code = :pollCode')
      .setParameters({ pollCode: code })
      .getOne();
  if (!poll) throw new Error('Could not find poll associated with given code.');
  return poll.id;
};

// Delete a poll by Id
const deletePollById = async (id: number) => {
  try {
    const poll = await db().findOneById(id);
    if (poll.code in pollCodes) {
      delete pollCodes[poll.code];
    }
    await db().remove(poll);
    await QuestionsRepo.deleteQuestionsWithoutPoll();
  } catch (e) {
    throw new Error(`Problem deleting poll by id: ${id}!`);
  }
};

// Delete code for a poll
const deleteCodeById = async (id: number): Promise<Poll> => {
  try {
    const poll = await db().findOneById(id);
    if (poll.code in pollCodes) {
      delete pollCodes[poll.code];
    }
    var field = {};
    field.code = '';
    await db().createQueryBuilder('polls')
      .where('polls.id = :pollId')
      .setParameters({ pollId: id })
      .update(field)
      .execute();
    return await db().findOneById(id);
  } catch (e) {
    throw new Error(`Problem deleting code for poll by id: ${id}`);
  }
};

// Update a poll by Id
const updatePollById = async (id: number, name: ?string):
  Promise<?Poll> => {
  try {
    var field = {};
    if (name) field.name = name;
    await db().createQueryBuilder('polls')
      .where('polls.id = :pollId')
      .setParameters({ pollId: id })
      .update(field)
      .execute();
    return await db().findOneById(id);
  } catch (e) {
    throw new Error(`Problem updating poll by id: ${id}!`);
  }
};

// Add admin/member to a poll by Id
const addUserByPollId = async (id: number, user: User, role: ?string):
  Promise<?Poll> => {
  try {
    const poll = await db().createQueryBuilder('polls')
      .leftJoinAndSelect('polls.admins', 'admins')
      .leftJoinAndSelect('polls.members', 'members')
      .leftJoinAndSelect('polls.questions', 'questions')
      .where('polls.id = :pollId')
      .setParameters({ pollId: id })
      .getOne();

    if (user) {
      if (role === 'admin') {
        poll.admins = poll.admins.concat(user);
      } else {
        poll.members = poll.members.concat(user);
      }
      await db().persist(poll);
    }

    return poll;
  } catch (e) {
    throw new Error(`Problem adding admin to poll by id: ${id}`);
  }
};

// Remove admin/member of a poll by Id
const removeUserByPollId = async (id: number, user: User, role: ?string):
  Promise<?Poll> => {
  try {
    const poll = await db().createQueryBuilder('polls')
      .leftJoinAndSelect('polls.admins', 'admins')
      .leftJoinAndSelect('polls.members', 'members')
      .leftJoinAndSelect('polls.questions', 'questions')
      .where('polls.id = :pollId')
      .setParameters({ pollId: id })
      .getOne();
    if (user) {
      if (role === 'admin') {
        poll.admins = poll.admins.filter(function (admin) {
          return (admin.googleId !== user.googleId);
        });
      } else {
        poll.members = poll.members.filter(function (member) {
          return (member.googleId !== user.googleId);
        });
      }
      await db().persist(poll);
    }

    return poll;
  } catch (e) {
    throw new Error(`Problem removing admin from poll by id: ${id}`);
  }
};

// Return true if user is an admin of a poll by id
const isAdmin = async (id: number, user: User):
  Promise<?boolean> => {
  try {
    const poll = await db().createQueryBuilder('polls')
      .leftJoinAndSelect('polls.admins', 'admins')
      .where('polls.id = :pollId')
      .setParameters({ pollId: id })
      .getOne();

    const admins = poll.admins;
    for (var i in admins) {
      if (admins[i].googleId === user.googleId) {
        return true;
      }
    }
    return false;
  } catch (e) {
    throw new Error(`Problem verifying admin status for poll ${id}`);
  }
};

// Get admins/members from a poll id
const getUsersByPollId = async (id: number, role: ?string):
  Promise<Array<?User>> => {
  try {
    const poll = await db().createQueryBuilder('polls')
      .leftJoinAndSelect('polls.admins', 'admins')
      .leftJoinAndSelect('polls.members', 'members')
      .where('polls.id = :pollId')
      .setParameters({ pollId: id })
      .getOne();
    if (role === 'admin') {
      return poll.admins;
    } else if (role === 'member') {
      return poll.members;
    } else {
      return poll.admins.concat(poll.members);
    }
  } catch (e) {
    throw new Error(`Problem getting admins for poll with id: ${id}!`);
  }
};

// Delete polls where poll.group = null AND
// poll.code = null or ''
const deletePollsWithOutGroup = async () => {
  try {
    await db().createQueryBuilder('polls')
      .delete()
      .where('polls.group is NULL')
      .andWhere('polls.code is NULL')
      .execute();
  } catch (e) {
    throw new Error('Problem removing polls with no group reference.');
  }
};

export default {
  pollCodes,
  createPoll,
  createCode,
  deleteCodeById,
  getPollById,
  getPollId,
  updatePollById,
  deletePollById,
  addUserByPollId,
  removeUserByPollId,
  getUsersByPollId,
  isAdmin,
  deletePollsWithOutGroup
};
