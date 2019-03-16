// @flow
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import Base from './Base';
import constants from '../utils/Constants';
import Group from './Group';

import type {
  PollType, PollState,
} from '../utils/Constants';

export type PollResult = {|
  letter?: string,
  text: string,
  count: number
|}

export type PollChoice = {|
  letter?: string,
  text: string
|}

@Entity('polls')
/**
 * Poll class represents a single question
 * @extends {Base}
 */
class Poll extends Base {
  @PrimaryGeneratedColumn()
  /** Unique identifier */
  id: any = null;

  @Column('string')
  /** Text of question */
  text: string = '';

  @Column('string')
  /** Type of question either multipleChoice or freeResponse */
  type: PollType = 'multipleChoice';

  @ManyToOne(type => Group, group => group.polls, {
    onDelete: 'CASCADE',
  })
  /** Group the poll belongs to */
  group: ?Group = null;

  @Column('json')
  /**
   * Choices for the poll
   * count only exists when mc poll is shared
   * @example
   * let results_mc = {letter: "A", text: "Saturn", count: 5}
   * let results_fr = {text: "Saturn", count: 10}
   */
  answerChoices: PollResult[] = [];

  @Column('json')
  /** All the answers by students for the poll.
   * the letter field is optional and only is returned on mc questions
   * @example
   * let userAnswer = {googldID: "abc123", letter: "A", text: "Saturn"}
   */
  userAnswers: {[string]: PollChoice[]} = {};

  @Column('string')
  /**
   * Correct answer choice for MC.
   * Empty string if FR or no correct answer chosen for MC.
   * @example
   * let correctAnswer = 'A'
  */
  correctAnswer: string = '';

  @Column('string')
  /**
   * The current state of the poll
   */

  state: PollState = constants.POLL_STATES.LIVE;
}

export default Poll;
