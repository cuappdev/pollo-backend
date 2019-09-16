// @flow
import { getRepository, Repository } from 'typeorm';
import Group from '../models/Group';
import Poll from '../models/Poll';
import LogUtils from '../utils/LogUtils';

import type { PollChoice, PollResult } from '../models/Poll';
import type { PollType, PollState } from '../utils/Constants';

const db = (): Repository<Poll> => getRepository(Poll);

/**
 * Create a poll and saves it to the db
 * @function
 * @param {string} text - Text of poll
 * @param {Group} group - Group that the poll belongs to
 * @param {PollResult[]} answerChoices - the answer choices for the given poll
 * @param {string} type - Type of poll, see Poll class for more info
 * @param {string} correctAnswer - Correct answer choice for MC
 * @param {string: PollChoice[]} answers - answers given from students
 * @param {PollState} state - the current state of the poll
 * @param {string: PollChoice[]} upvotes - upvotes given from students
 * @return {Poll} New poll created
 */
const createPoll = async (
  text: string,
  group: ?Group,
  answerChoices: PollResult[],
  type: PollType,
  correctAnswer: ?string,
  answers: ?{ string: PollChoice[] },
  state: PollState,
  upvotes: ?{ string: PollChoice[] },
): Promise<Poll> => {
  try {
    const poll = new Poll();
    poll.answerChoices = answerChoices;
    poll.correctAnswer = correctAnswer || '';
    poll.state = state;
    poll.text = text;
    poll.type = type;
    if (group) poll.group = group;
    if (answers) poll.answers = answers;
    if (upvotes) poll.upvotes = upvotes;
    await db().save(poll);
    return poll;
  } catch (e) {
    throw LogUtils.logErr('Problem creating poll', e, {
      text,
      group,
      answerChoices,
      type,
      correctAnswer,
      answers,
      state,
      upvotes,
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
    return await db().findOne(id);
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
    const poll = await db().findOne(id);
    await db().remove(poll);
  } catch (e) {
    throw LogUtils.logErr(`Problem deleting poll by id: ${id}`, e);
  }
};

/**
 * Update a poll
 * @function
 * @param {number} id - id of the poll to update
 * @param {?string} [text] - new text for poll
 * @param {?PollResult[]} answerChoices - the answer choices for the given poll
 * @param {string: PollChoice[]} [answers] - the students answers to the poll
 * @param {string: PollChoice[]} [upvotes] - upvotes from students
 * @param {PollState} [state] - the state of the poll
 * @return {?Poll} Updated poll
 */
const updatePollByID = async (
  id: number,
  text: ?string,
  answerChoices: ?PollResult[],
  answers: ?{ string: PollChoice[] },
  upvotes: ?{ string: PollChoice[] },
  state: ?PollState,
): Promise<?Poll> => {
  try {
    const poll = await db().createQueryBuilder('polls')
      .leftJoinAndSelect('polls.group', 'group')
      .where('polls.id = :pollID')
      .setParameters({ pollID: id })
      .getOne();
    if (text !== undefined && text !== null) poll.text = text;
    if (answerChoices) poll.answerChoices = answerChoices;
    if (answers) poll.answers = answers;
    if (upvotes) poll.upvotes = upvotes;
    if (state) poll.state = state;
    await db().save(poll);
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
const getGroupFromPollID = async (id: number): Promise<?Group> => {
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
