// @flow
import {
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import Base from './Base';
import Poll from './Poll';
import Question from './Question';
import User from './User';

@Entity('groups')
/**
 * Group class represents a grouping of polls.
 * @extends {Base}
 */
class Group extends Base {
  @PrimaryGeneratedColumn()
  /** Unique identifier */
  id: any = null;

  @Column('string')
  /** Name of group */
  name: string = '';

  @Column('string')
  /** Unique code to join group */
  code: string = '';

  @ManyToMany(type => User, user => user.adminGroups)
  @JoinTable()
  /** Admins of the group */
  admins: ?User[] = [];

  @OneToMany(type => Poll, poll => poll.group, {
      cascadeRemove: true,
  })
  /** Polls belonging to the group */
  polls: ?Poll[] = [];

  @OneToMany(type => Question, question => question.group, {
      cascadeRemove: true,
  })
  /** Questions belonging to the group */
  questions: ?Question[] = [];

  @ManyToMany(type => User, user => user.memberGroups)
  @JoinTable()
  /** Member of the group */
  members: ?User[] = [];
}

export default Group;
