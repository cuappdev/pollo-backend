// @flow
import { getConnectionManager, json, Repository } from 'typeorm';
import LogUtils from '../utils/LogUtils';
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
 * @param {string} correctAnswer - Correct answer choice for MC
 * @param {json} [userAnswers] - Json mapping users to their answers
 * @return {Poll} New poll created
 */
const createPoll = async (text: string, session: ?Session, results: json,
    canShare: boolean, type: string, correctAnswer: string, userAnswers: ?json):
  Promise <Poll> => {
    try {
        const poll = new Poll();
        poll.text = text;
        poll.session = session;
        poll.results = results;
        poll.shared = canShare;
        poll.type = type;
        poll.correctAnswer = correctAnswer;
        poll.userAnswers = userAnswers || {};

        await db().persist(poll);
        return poll;
    } catch (e) {
        throw LogUtils.logError('Problem creating poll!');
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
        throw LogUtils.logError(`Problem getting poll by id: ${id}!`);
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
        throw LogUtils.logError(`Problem deleting poll with id: ${id}!`);
    }
};

/**
 * Update a poll
 * @function
 * @param {number} id - id of the poll to update
 * @param {string} [text] - new text for poll
 * @param {json} [results] - new results for poll
 * @param {boolean} [canShare] - new shared option for poll
 * @param {json} [userAnswers] - new json of user answers
 * @return {?Poll} Updated poll
 */
const updatePollById = async (id: number, text: ?string, results: ?json,
    canShare: ?boolean, userAnswers: ?json):
  Promise<?Poll> => {
    try {
        const poll = await db().createQueryBuilder('polls')
            .leftJoinAndSelect('polls.session', 'session')
            .where('polls.id = :pollId')
            .setParameters({ pollId: id })
            .getOne();

        if (text !== undefined && text !== null) poll.text = text;
        if (results) poll.results = results;
        if (canShare !== null && canShare !== undefined) poll.shared = canShare;
        if (userAnswers) poll.userAnswers = userAnswers;

        await db().persist(poll);
        return poll;
    } catch (e) {
        throw LogUtils.logError(`Problem updating poll by id: ${id}!`);
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
        throw LogUtils.logError(`Problem getting session from quesiton with id: ${id}!`);
    }
};

export default {
    createPoll,
    deletePollById,
    getPollById,
    updatePollById,
    getSessionFromPollId,
};
