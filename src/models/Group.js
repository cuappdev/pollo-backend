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

export type Coord = {| lat: ?number, long: ?number |}

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

  /** Most recent coordinates of the admin of the group */
  @Column('json')
  location: Coord = { lat: null, long: null };

  /** If filter is activated for FR responses or live questions */
  @Column('boolean')
  isFilterActivated: boolean = true

  /** If joining a group requires user to be within 300m of the group location */
  @Column('boolean')
  isLocationRestricted: boolean = false

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
