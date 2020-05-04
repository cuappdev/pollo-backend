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
import type { PollState } from '../utils/Constants';

import constants from '../utils/Constants';

export type PollResult = {|
  index: number,
  text: string,
  count: number,
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

  /** Group the poll belongs to */
  @ManyToOne(type => Group, group => group.polls, { onDelete: 'CASCADE' })
  group: ?Group = null;

  /**
   * Choices for the poll
   * @example
   * let answerChoices = [{index: 0, text: "Saturn", count: 5}]
   */
  @Column('json')
  answerChoices: PollResult[] = undefined;

  /**
   * All the answers by students for the poll.
   * @example
   * let answers = {googleID: [0, 1, 3]}
   */
  @Column('json')
  answers: { string: number[] } = {};

  /**
   * Correct answer choice.
   * -1 if no correct answer chosen.
   * @example
   * let correctAnswer = 3
  */
  @Column('int')
  correctAnswer: number = -1;

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
      userAnswers: this.answers,
    };
  }
}

export default Poll;
