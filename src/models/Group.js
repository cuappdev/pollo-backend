// @flow
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import uuidv4 from 'uuid/v4';
import Base from './Base';
import Poll from './Poll';
import User from './User';

import type { APIGroup } from '../routers/v2/APITypes';

/**
 * Group class represents a grouping of polls.
 * @extends {Base}
 */
@Entity('groups')
class Group extends Base {
  /** Universally unique identifier */
  @PrimaryGeneratedColumn('uuid')
  uuid: string = uuidv4();

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
  /** Member of the group */
  members: ?User[] = undefined;

  serialize(): APIGroup {
    return {
      ...super.serialize(),
      id: this.uuid,
      code: this.code,
      isLive: false,
      name: this.name,
    };
  }
}

export default Group;
