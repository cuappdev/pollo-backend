// @flow
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import uuidv4 from 'uuid/v4';
import Base from './Base';
import Group from './Group';

import type { APIPoll } from '../routers/v2/APITypes';
import type { PollType, PollState } from '../utils/Constants';

import constants from '../utils/Constants';

export type PollResult = {|
  letter: ?string,
  text: string,
  count: ?number,
|}

export type PollChoice = {|
  letter: ?string,
  text: string,
|}

/**
 * Poll class represents a single poll
 * @extends {Base}
 */
@Entity('polls')
class Poll extends Base {
  /** Universally unique identifier */
  @PrimaryGeneratedColumn('uuid')
  uuid: string = uuidv4();

  /** Text of poll */
  @Column('character varying')
  text: string = '';

  /** Type of poll either multipleChoice or freeResponse */
  @Column('character varying')
  type: PollType = constants.POLL_TYPES.MULTIPLE_CHOICE;

  /** Group the poll belongs to */
  @ManyToOne(type => Group, group => group.polls, { onDelete: 'CASCADE' })
  group: ?Group = null;

  /**
   * Choices for the poll
   * @example
   * let answerChoices_mc = [{letter: "A", text: "Saturn", count: 5}]
   * let answerChoices_fr = [{text: "Saturn", count: 10}]
   */
  @Column('json')
  answerChoices: PollResult[] = undefined;

  /**
   * All the answers by students for the poll.
   * Letter field is optional and only is returned on MC polls.
   * @example
   * let answers_MC = {googleID: [{letter: "A", text: "Saturn"}]}
   * let answers_FR = {googleID: [{text: "Saturn"}, {text: "Mars"}]}
   */
  @Column('json')
  answers: { string: PollChoice[] } = {};

  /**
   * All the upvotes by students for the FR poll. Empty if MC.
   * @example
   * let upvotes_MC = {}
   * let upvotes_FR = {googleID: [{text: "Saturn"}, {text: "Mars"}]}
   */
  @Column('json')
  upvotes: { string: PollChoice[] } = {};

  /**
   * Correct answer choice for MC.
   * Empty string if FR or no correct answer chosen for MC.
   * @example
   * let correctAnswer = 'A'
  */
  @Column('character varying')
  correctAnswer: string = '';

  /** The current state of the poll */
  @Column('character varying')
  state: PollState = constants.POLL_STATES.ENDED;

  serialize(): APIPoll {
    return {
      ...super.serialize(),
      id: this.uuid,
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
