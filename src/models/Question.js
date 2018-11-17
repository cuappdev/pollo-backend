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

@Entity('questions')
/**
 * Question class represents questions a member can ask an admin
 * during a group.
 * @extends {Base}
 */
class Question extends Base {
  @PrimaryGeneratedColumn()
  /** Unique identifier */
  id: any = null;

  @Column('string')
  /** Text of question user is asking */
  text: string = '';

  @ManyToOne(type => Group, group => group.polls, {
      onDelete: 'CASCADE',
  })
  /** Group that the question is being asked in */
  group: ?Group = null;

  @ManyToOne(type => User, user => user.questions)
  /** User who asked the question */
  user: ?User = null;
}

export default Question;
