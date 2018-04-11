// @flow
import { getConnectionManager, Repository, json } from 'typeorm';
import { Session } from '../models/Session';
import { Poll } from '../models/Poll';

const db = (): Repository<Poll> => {
  return getConnectionManager().get().getRepository(Poll);
};

// Create a poll
const createPoll = async (text: string, session: Session, results: json,
  canShare: boolean):
  Promise <Poll> => {
  try {
    const poll = new Poll();
    poll.text = text;
    poll.session = session;
    poll.results = results;
    poll.shared = canShare;

    await db().persist(poll);
    return poll;
  } catch (e) {
    throw new Error('Problem creating poll!');
  }
};

// Get a poll by id
const getPollById = async (id: number): Promise<?Poll> => {
  try {
    const poll = await db().findOneById(id);
    return poll;
  } catch (e) {
    throw new Error(`Problem getting poll by id: ${id}!`);
  }
};

// Delete a poll
const deletePollById = async (id: number) => {
  try {
    const poll = await db().findOneById(id);
    await db().remove(poll);
  } catch (e) {
    throw new Error(`Problem deleting poll with id: ${id}!`);
  }
};

// Update a poll by id
const updatePollById = async (id: number, text: ?string, results: ?json,
  canShare: ?boolean):
  Promise<?Poll> => {
  try {
    var field = {};
    if (text) field.text = text;
    if (results) field.results = results;
    if (canShare !== null) field.shared = canShare;

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

// Get all polls from a session id
const getPollsFromSessionId = async (id: number):
  Promise<Array<?Poll>> => {
  try {
    const polls = await db().createQueryBuilder('polls')
      .innerJoin('polls.session', 'session', 'session.id = :sessionId')
      .setParameters({ sessionId: id })
      .getMany();
    return polls;
  } catch (e) {
    throw new Error(`Problem getting polls for session with id: ${id}!`);
  }
};

// Get shared polls from a session id
const getSharedPollsFromSessionId = async (id: number):
  Promise<Array<?Poll>> => {
  try {
    const polls = await db().createQueryBuilder('polls')
      .innerJoin('polls.session', 'session', 'session.id = :sessionId')
      .where('polls.shared')
      .setParameters({ sessionId: id })
      .getMany();
    return polls;
  } catch (e) {
    throw new Error(`Problem getting polls for session with id: ${id}!`);
  }
};

// Get a session from poll
const getSessionFromPollId = async (id: number) : Promise<?Session> => {
  try {
    const poll = await db().createQueryBuilder('polls')
      .leftJoinAndSelect('polls.session', 'session')
      .where('polls.id = :pollId', {pollId: id})
      .getOne();
    return poll.session;
  } catch (e) {
    throw new Error(`Problem getting session from quesiton with id: ${id}!`);
  }
};

export default {
  createPoll,
  deletePollById,
  getPollById,
  updatePollById,
  getPollsFromSessionId,
  getSessionFromPollId,
  getSharedPollsFromSessionId
};
