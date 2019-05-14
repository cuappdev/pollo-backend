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

import type { APIPoll } from '../routers/v2/APITypes';
import type { PollType, PollState } from '../utils/Constants';

export type PollResult = {|
  letter: ?string,
  text: string,
  count: ?number
|}

export type PollChoice = {|
  letter: ?string,
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
  type: PollType = constants.POLL_TYPES.MULTIPLE_CHOICE;

  @ManyToOne(type => Group, group => group.polls, {
    onDelete: 'CASCADE',
  })
  /** Group the poll belongs to */
  group: ?Group = null;

  @Column('json')
  /**
   * Choices for the poll
   * @example
   * let answerChoices_mc = [{letter: "A", text: "Saturn", count: 5}]
   * let answerChoices_fr = [{text: "Saturn", count: 10}]
   */
  answerChoices: PollResult[] = [];

  @Column('json')
  /** All the answers by students for the poll.
   * Letter field is optional and only is returned on mc questions
   * @example
   * let answers_MC = {googleID: [{letter: "A", text: "Saturn"}]}
   * let answers_FR = {googleID: [{text: "Saturn"}, {text: "Mars"}]}
   */
  answers: { string: PollChoice[] } = {};

  @Column('json')
  /** All the upvotes by students for the FR poll. Empty if MC.
   * @example
   * let upvotes_MC = {}
   * let upvotes_FR = {googleID: [{text: "Saturn"}, {text: "Mars"}]}
   */
  upvotes: { string: PollChoice[] } = {};

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

  state: PollState = constants.POLL_STATES.ENDED;

  serialize(): APIPoll {
    return {
      ...super.serialize(),
      answerChoices: this.answerChoices,
      correctAnswer: this.correctAnswer,
      state: this.state,
      text: this.text,
      type: this.type,
      userAnswers: this.answers,
    };
  }
}

export default Poll;
