// @flow
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import Base from './Base';
import Group from './Group';
import User from './User';

/**
 * Question class represents questions a member can ask an admin
 * during a group.
 * @extends {Base}
 */
@Entity('questions')
class Question extends Base {
  /** Unique identifier */
  @PrimaryGeneratedColumn()
  id: any = null;

  /** Text of question user is asking */
  @Column('string')
  text: string = '';

  /** Group that the question is being asked in */
  @ManyToOne(type => Group, group => group.polls, { onDelete: 'CASCADE' })
  group: ?Group = null;

  /** User who asked the question */
  @ManyToOne(type => User, user => user.questions)
  user: ?User = null;
}

export default Question;
