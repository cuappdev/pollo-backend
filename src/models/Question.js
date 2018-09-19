// @flow
import {
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import Base from './Base';
import Session from './Session';
import User from './User';

@Entity('questions')
/**
 * Question class represents questions a member can ask an admin
 * during a session.
 * @extends {Base}
 */
class Question extends Base {
  @PrimaryGeneratedColumn()
  /** Unique identifier */
  id: any = null;

  @Column('string')
  /** Text of question user is asking */
  text: string = '';

  @ManyToOne(type => Session, session => session.polls, {
      onDelete: 'CASCADE',
  })
  /** Session that the question is being asked in */
  session: ?Session = null;

  @ManyToOne(type => User, user => user.questions)
  /** User who asked the question */
  user: ?User = null;
}

export default Question;
