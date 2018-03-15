// @flow
import { getConnectionManager, Repository } from 'typeorm';
import {Poll} from '../models/Poll';
import {User} from '../models/User';
import appDevUtils from '../utils/appDevUtils';
import QuestionsRepo from '../repos/QuestionsRepo';

const db = (): Repository<Poll> => {
  return getConnectionManager().get().getRepository(Poll);
};

// Contains all poll codes used mapped to poll id
var pollCodes = {};

// Create a poll
const createPoll = async (name: string, code: string, user: User):
  Promise<Poll> => {
  try {
    const poll = new Poll();
    poll.name = name;
    poll.code = code;
    poll.admins = [user];

    if (pollCodes[code]) throw new Error('Poll code is already in use');

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

// Add admin to a poll by Id
const addAdminByPollId = async (id: number, user: User):
  Promise<?Poll> => {
    try {
      const poll = await db().findOneById(id);
      poll.admins.push(user);
      return poll;
    } catch (e) {
      throw new Error(`Problem adding admin to poll by id: ${id}`);
    }
  };

// Remove admin of a poll by Id
const removeAdminByPollId = async (id:number, user: User):
  Promise<?Poll> => {
    try {
      const poll = await db().findOneById(id);
      const index = poll.admins.indexOf(user);
      if (index > -1) {
        poll.admins.splice(index,1);
      }
      return poll;
    } catch (e) {
      throw new Error(`Problem adding admin to poll by id: ${id}`);
    }
  };

  const isAdmin = async (id: number, user: User):
    Promise<?boolean> => {
      try {
        const poll = await db().findOneById(id);
        const admins = poll.admins;
        var i;
        for (i in poll.admins) {
          if (admins[i].googleId == user.googleId) {
            return true;
          }
        }
        return false;
      } catch (e) {
        throw new Error(`Problem verifying admin status for poll ${id}`);
      }
    };

export default {
  createPoll,
  createCode,
  getPollById,
  getPollId,
  updatePollById,
  deletePollById,
  addAdminByPollId,
  removeAdminByPollId,
  isAdmin
};
