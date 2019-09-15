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

export type Coord = {| lat: ?number, long: ?number |}

@Entity('groups')
/**
 * Group class represents a grouping of polls.
 * @extends {Base}
 */
class Group extends Base {
  @PrimaryGeneratedColumn()
  /** Unique identifier */
  id: any = null;

  @Column('character varying')
  /** Name of group */
  name: string = '';

  @Column('character varying')
  /** Unique code to join group */
  code: string = '';

  @Column('json')
  /** Most recent coordinates of the admin of the group */
  location: Coord = { lat: null, long: null };

  @Column('boolean')
  /** If filter is activated for FR responses or live questions */
  isFilterActivated: boolean = true

  @Column('boolean')
  /** If joining a group requires user to be within 300m of the group location */
  isLocationRestricted: boolean = false

  @ManyToMany(type => User, user => user.adminGroups)
  @JoinTable()
  /** Admins of the group */
  admins: ?User[] = undefined;

  @OneToMany(type => Poll, poll => poll.group, {
    cascadeRemove: true,
  })
  /** Polls belonging to the group */
  polls: ?Poll[];

  @OneToMany(type => Question, question => question.group, {
    cascadeRemove: true,
  })
  /** Questions belonging to the group */
  questions: ?Question[];

  @ManyToMany(type => User, user => user.memberGroups)
  @JoinTable()
  /** Member of the group */
  members: ?User[];
}

export default Group;
