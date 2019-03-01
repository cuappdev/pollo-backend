// @flow
import { getConnectionManager, json, Repository } from 'typeorm';
import LogUtils from '../utils/LogUtils';
import Poll from '../models/Poll';
import Group from '../models/Group';

const db = (): Repository<Poll> => getConnectionManager().get().getRepository(Poll);

/**
 * Create a poll and saves it to the db
 * @function
 * @param {string} text - Text of poll
 * @param {Group} [group] - Group that the poll belongs to
 * @param {json} results - Results of poll
 * @param {boolean} canShare - Whether the results of the poll are shared
 * @param {string} type - Type of poll, see Poll class for more info
 * @param {string} correctAnswer - Correct answer choice for MC
 * @param {json} [userAnswers] - Json mapping users to their answers
 * @return {Poll} New poll created
 */
const createPoll = async (text: string, group: ?Group, results: json,
    canShare: boolean, type: string, correctAnswer: string, userAnswers: ?json):
  Promise <Poll> => {
    try {
        const poll = new Poll();
        poll.text = text;
        poll.group = group;
        poll.results = results;
        poll.shared = canShare;
        poll.type = type;
        poll.correctAnswer = correctAnswer;
        poll.userAnswers = userAnswers || {};

        await db().persist(poll);
        return poll;
    } catch (e) {
        throw LogUtils.logErr('Problem creating poll', e, {
            text, group, results, canShare, type, correctAnswer, userAnswers,
        });
    }
};

/**
 * Get a poll by id
 * @function
 * @param {number} id - id of the poll we want
 * @return {?Poll} Poll with corresponding id
 */
const getPollByID = async (id: number): Promise<?Poll> => {
    try {
        return await db().findOneById(id);
    } catch (e) {
        throw LogUtils.logErr(`Problem getting poll by id: ${id}`, e);
    }
};

/**
 * Delete a poll
 * @function
 * @param {number} id - id of the poll to delete
 */
const deletePollByID = async (id: number) => {
    try {
        const poll = await db().findOneById(id);
        await db().remove(poll);
    } catch (e) {
        throw LogUtils.logErr(`Problem deleting poll by id: ${id}`, e);
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
const updatePollByID = async (id: number, text: ?string, results: ?json,
    canShare: ?boolean, userAnswers: ?json):
  Promise<?Poll> => {
    try {
        const poll = await db().createQueryBuilder('polls')
            .leftJoinAndSelect('polls.group', 'group')
            .where('polls.id = :pollID')
            .setParameters({ pollID: id })
            .getOne();

        if (text !== undefined && text !== null) poll.text = text;
        if (results) poll.results = results;
        if (canShare !== null && canShare !== undefined) poll.shared = canShare;
        if (userAnswers) poll.userAnswers = userAnswers;

        await db().persist(poll);
        return poll;
    } catch (e) {
        throw LogUtils.logErr(`Problem updating poll by id: ${id}`, e);
    }
};

/**
 * Get group that a poll belongs to
 * @function
 * @param {number} id - id of poll we want to find the group for
 * @return {?Group} Group that the poll belongs to
 */
const getGroupFromPollID = async (id: number) : Promise<?Group> => {
    try {
        const poll = await db().createQueryBuilder('polls')
            .leftJoinAndSelect('polls.group', 'group')
            .where('polls.id = :pollID', { pollID: id })
            .getOne();
        return poll.group;
    } catch (e) {
        throw LogUtils.logErr(`Problem getting group from question by id: ${id}`, e);
    }
};

export default {
    createPoll,
    deletePollByID,
    getGroupFromPollID,
    getPollByID,
    updatePollByID,
};
