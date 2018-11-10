// @flow
import {
    Column,
    Entity,
    json,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import Base from './Base';
import Session from './Session';

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
  /** Type of question either MULTIPLE_CHOICE or FREE_RESPONSE */
  type: string = '';

  @ManyToOne(type => Session, session => session.polls, {
      onDelete: 'CASCADE',
  })
  /** Session the poll belongs to */
  session: ?Session = null;

  @Column('json')
  /**
   * Result of the poll
   * @example
   * let results_mc = {'A': {'text': 'blue', 'count': 0}}
   * let results_fr = {'blue': {'text': 'blue', 'count': 0}}
   */
  results: json = {};

  @Column('json')
  /** Google id of users mapped to their answer (key in results) */
  userAnswers: json = {};

  @Column('boolean')
  /** If the results of the poll is shared to all users */
  shared: boolean = true;

  @Column('string')
  /**
   * Correct answer choice for MC.
   * Empty string if FR or no correct answer chosen for MC.
   * @example
   * let correctAnswer = 'A'
  */
  correctAnswer: string = '';
}

export default Poll;
