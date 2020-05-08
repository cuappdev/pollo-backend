// @flow
import { getRepository, Repository } from 'typeorm';
import Group from '../models/Group';
import Poll from '../models/Poll';
import LogUtils from '../utils/LogUtils';

import type { PollResult } from '../models/Poll';
import type { PollState } from '../utils/Constants';

const db = (): Repository<Poll> => getRepository(Poll);

/**
 * Create a poll and saves it to the db
 * @function
 * @param {string} text - Text of poll
 * @param {Group} group - Group that the poll belongs to
 * @param {PollResult[]} answerChoices - the answer choices for the given poll
 * @param {number} correctAnswer - Correct answer choice
 * @param {string: number[]} answers - answers given from students
 * @param {PollState} state - the current state of the poll
 * @return {Poll} New poll created
 */
const createPoll = async (
  text: string,
  group: ?Group,
  answerChoices: PollResult[],
  correctAnswer: number,
  answers: ?{ string: number[] },
  state: PollState,
): Promise<Poll> => {
  try {
    const poll = new Poll();
    poll.answerChoices = answerChoices;

    if (correctAnswer !== undefined && correctAnswer !== null) poll.correctAnswer = correctAnswer;
    else poll.correctAnswer = -1;
    
    poll.state = state;
    poll.text = text;
    if (group) poll.group = group;
    if (answers) poll.answers = answers;
    await db().save(poll);
    return poll;
  } catch (e) {
    console.log(e);
    throw LogUtils.logErr('Problem creating poll', e, {
      text,
      group,
      answerChoices,
      correctAnswer,
      answers,
      state,
    });
  }
};

/**
 * Get a poll by UUID
 * @function
 * @param {string} id - UUID of the poll we want
 * @return {?Poll} Poll with corresponding UUID
 */
const getPollByID = async (id: string): Promise<?Poll> => {
  try {
    return await db().createQueryBuilder('polls')
      .where('polls.uuid = :pollID')
      .setParameters({ pollID: id })
      .getOne();
  } catch (e) {
    throw LogUtils.logErr(`Problem getting poll by UUID: ${id}`, e);
  }
};

/**
 * Delete a poll
 * @function
 * @param {string} id - UUID of the poll to delete
 */
const deletePollByID = async (id: string) => {
  try {
    const poll = await getPollByID(id);
    await db().remove(poll);
  } catch (e) {
    throw LogUtils.logErr(`Problem deleting poll by UUID: ${id}`, e);
  }
};

/**
 * Update a poll
 * @function
 * @param {string} id - UUID of the poll to update
 * @param {?string} [text] - new text for poll
 * @param {?PollResult[]} answerChoices - the answer choices for the given poll
 * @param {string: number[]} [answers] - the students answers to the poll
 * @param {PollState} [state] - the state of the poll
 * @return {?Poll} Updated poll
 */
const updatePollByID = async (id: string, text: ?string, answerChoices: ?PollResult[],
  answers: ?{string: number[]}, state: ?PollState):
  Promise<?Poll> => {
  try {
    const poll = await db().createQueryBuilder('polls')
      .leftJoinAndSelect('polls.group', 'group')
      .where('polls.uuid = :pollID')
      .setParameters({ pollID: id })
      .getOne();
    if (text !== undefined && text !== null) poll.text = text;
    if (answerChoices) poll.answerChoices = answerChoices;
    if (answers) poll.answers = answers;
    if (state) poll.state = state;
    await db().save(poll);
    return poll;
  } catch (e) {
    throw LogUtils.logErr(`Problem updating poll by UUID: ${id}`, e);
  }
};

/**
 * Get group that a poll belongs to
 * @function
 * @param {string} id - UUID of poll we want to find the group for
 * @return {?Group} Group that the poll belongs to
 */
const getGroupFromPollID = async (id: string): Promise<?Group> => {
  try {
    const poll = await db().createQueryBuilder('polls')
      .leftJoinAndSelect('polls.group', 'group')
      .where('polls.uuid = :pollID', { pollID: id })
      .getOne();
    return poll.group;
  } catch (e) {
    throw LogUtils.logErr(`Problem getting group from poll by UUID: ${id}`, e);
  }
};

export default {
  createPoll,
  deletePollByID,
  getGroupFromPollID,
  getPollByID,
  updatePollByID,
};
