// @flow
import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import uuidv4 from 'uuid/v4';
import Base from './Base';
import Draft from './Draft';
import Group from './Group';
import appDevUtils from '../utils/AppDevUtils';

import type { APIUser } from '../routers/v2/APITypes';

/**
 * User class represents a user on the application.
 * @extends {Base}
 */
@Entity('users')
class User extends Base {
  /** Universally unique identifier */
  @PrimaryGeneratedColumn('uuid')
  uuid: string = uuidv4();

  /** Google ID of user */
  @Column('character varying')
  googleID: string = '';

  /** Net ID of user */
  @Column('character varying')
  netID: string = '';

  /** Email of user */
  @Column('character varying')
  email: string = '';

  /** User first name */
  @Column('character varying')
  firstName: string = '';

  /** User last name */
  @Column('character varying')
  lastName: string = '';

  /** Groups that the user is an admin of */
  @ManyToMany(type => Group, group => group.admins)
  adminGroups: ?Group[] = undefined;

  /** Groups that the user is a member of */
  @ManyToMany(type => Group, group => group.members)
  memberGroups: ?Group[] = undefined;

  /** Drafts that a user has created */
  @OneToMany(type => Draft, draft => draft.user)
  drafts: ?Draft[] = undefined;

  /**
   * Method to create a dummy user. (For testing purposes)
   * @function
   * @param {string} id - google id used to create new user
   * @return {User} a new user with supplied google id
   */
  static dummy(email: string): User {
    const user = new User();
    user.googleID = 'googleID';
    user.firstName = '';
    user.lastName = '';
    user.email = email;
    user.netID = '';
    return user;
  }

  serialize(): APIUser {
    return {
      ...super.serialize(),
      id: this.uuid,
      name: `${this.firstName} ${this.lastName}`,
      netID: this.netID,
    };
  }
}

export default User;
