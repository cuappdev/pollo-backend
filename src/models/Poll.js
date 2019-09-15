// @flow
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import Base from './Base';
import Group from './Group';
import constants from '../utils/Constants';
import type {
  PollType,
  PollState,
} from '../utils/Constants';

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
 * Poll class represents a single question
 * @extends {Base}
 */
@Entity('polls')
class Poll extends Base {
  /** Unique identifier */
  @PrimaryGeneratedColumn()
  id: any = null;

  /** Text of question */
  @Column('character varying')
  text: string = '';

  /** Type of question either multipleChoice or freeResponse */
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
   * Letter field is optional and only is returned on mc questions
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
}

export default Poll;
