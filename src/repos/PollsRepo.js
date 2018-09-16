// @flow
import { getConnectionManager, json, Repository } from 'typeorm';
import Poll from '../models/Poll';
import Session from '../models/Session';

const db = (): Repository<Poll> => getConnectionManager().get().getRepository(Poll);

/**
 * Create a poll and saves it to the db
 * @function
 * @param {string} text - Text of poll
 * @param {Session} [session] - Session that the poll belongs to
 * @param {json} results - Results of poll
 * @param {boolean} canShare - Whether the results of the poll are shared
 * @param {string} type - Type of poll, see Poll class for more info
 * @param {json} [userAnswers] - Json mapping users to their answers
 * @return {Poll} New poll created
 */
const createPoll = async (text: string, session: ?Session, results: json,
    canShare: boolean, type: string, userAnswers: ?json):
  Promise <Poll> => {
    try {
        const poll = new Poll();
        poll.text = text;
        poll.session = session;
        poll.results = results;
        poll.shared = canShare;
        poll.type = type;
        poll.userAnswers = userAnswers || {};

        await db().persist(poll);
        return poll;
    } catch (e) {
        throw new Error('Problem creating poll!');
    }
};

/**
 * Get a poll by id
 * @function
 * @param {number} id - id of the poll we want
 * @return {?Poll} Poll with corresponding id
 */
const getPollById = async (id: number): Promise<?Poll> => {
    try {
        return await db().findOneById(id);
    } catch (e) {
        throw new Error(`Problem getting poll by id: ${id}!`);
    }
};

/**
 * Delete a poll
 * @function
 * @param {number} id - id of the poll to delete
 */
const deletePollById = async (id: number) => {
    try {
        const poll = await db().findOneById(id);
        await db().remove(poll);
    } catch (e) {
        throw new Error(`Problem deleting poll with id: ${id}!`);
    }
};

/**
 * Update a poll
 * @function
 * @param {number} id - id of the poll to update
 * @param {text} [string] - new text for poll
 * @param {json} [results] - new results for poll
 * @param {boolean} [canShare] - new shared option for poll
 * @param {json} [userAnswers] - new json of user answers
 * @return {?Poll} Updated poll
 */
const updatePollById = async (id: number, text: ?string, results: ?json,
    canShare: ?boolean, userAnswers: ?json):
  Promise<?Poll> => {
    try {
        const field = {};
        if (text) field.text = text;
        if (results) field.results = results;
        if (canShare !== null) field.shared = canShare;
        if (userAnswers) field.userAnswers = userAnswers;

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

/**
 * Get all polls of a session
 * @function
 * @param {number} id - id of session we want to fetch polls of
 * @return {Poll[]} List of polls from specified session
 */
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

/**
 * Get all shared polls of a session
 * @function
 * @param {number} id - id of session we want to fetch polls of
 * @return {Poll[]} List of shared polls from specified session
 */
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

/**
 * Get session that a poll belongs to
 * @function
 * @param {number} id - id of poll we want to find the session for
 * @return {?Session} Session that the poll belongs to
 */
const getSessionFromPollId = async (id: number) : Promise<?Session> => {
    try {
        const poll = await db().createQueryBuilder('polls')
            .leftJoinAndSelect('polls.session', 'session')
            .where('polls.id = :pollId', { pollId: id })
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
    getSharedPollsFromSessionId,
};
