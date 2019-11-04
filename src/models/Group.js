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
import User from './User';

/**
 * Group class represents a grouping of polls.
 * @extends {Base}
 */
@Entity('groups')
class Group extends Base {
  /** Unique identifier */
  @PrimaryGeneratedColumn()
  id: any = null;

  /** Name of group */
  @Column('character varying')
  name: string = '';

  /** Unique code to join group */
  @Column('character varying')
  code: string = '';

  /** Admins of the group */
  @ManyToMany(type => User, user => user.adminGroups)
  @JoinTable()
  admins: ?User[] = undefined;

  /** Polls belonging to the group */
  @OneToMany(type => Poll, poll => poll.group, { cascadeRemove: true })
  polls: ?Poll[] = undefined;

  /** Member of the group */
  @ManyToMany(type => User, user => user.memberGroups)
  @JoinTable()
  members: ?User[] = undefined;
}

export default Group;
