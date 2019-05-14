// @flow
import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import Base from './Base';
import Draft from './Draft';
import Question from './Question';
import Group from './Group';
import appDevUtils from '../utils/AppDevUtils';

import type { APIUser } from '../routers/v2/APITypes';

@Entity('users')
/**
 * User class represents a user on the application.
 * @extends {Base}
 */
class User extends Base {
  @PrimaryGeneratedColumn()
  /** Unique identifier */
  id: any = null;

  @Column('string')
  /** Google ID of user */
  googleID: string = '';

  @Column('string')
  /** Net ID of user */
  netID: string = '';

  @Column('string')
  /** Email of user */
  email: string = '';

  @Column('string')
  /** User first name */
  firstName: string = '';

  @Column('string')
  /** User last name */
  lastName: string = '';

  @ManyToMany(type => Group, group => group.admins)
  /** Groups that the user is an admin of */
  adminGroups: ?Group[] = [];

  @ManyToMany(type => Group, group => group.members)
  /** Groups that the user is a member of */
  memberGroups: ?Group[] = [];

  @OneToMany(type => Question, question => question.user)
  /** Questions that a user has asked */
  questions: ?Question[] = [];

  @OneToMany(type => Draft, draft => draft.user)
  /** Drafts that a user has created */
  drafts: ?Draft[] = [];

  /**
   * Method to create a dummy user. (For testing purposes)
   * @function
   * @param {string} id - google id used to create new user
   * @return {User} a new user with supplied google id
   */
  static dummy(id: string): User {
    const user = new User();
    user.googleID = id;
    user.firstName = '';
    user.lastName = '';
    user.email = '';
    user.netID = '';
    return user;
  }

  /**
   * Parses google response to create User
   * @function
   * @param {Object} creds - credentials google returns
   * @return {User} a new user with info google supplied
   */
  static fromGoogleCreds(creds: Object): User {
    const user = new User();
    user.googleID = creds.id;
    user.firstName = creds.name.givenName;
    user.lastName = creds.name.familyName;
    user.email = creds.emails[0].value;
    user.netID = appDevUtils.netIDFromEmail(user.email);
    return user;
  }

  serialize(): APIUser {
    return {
      ...super.serialize(),
      name: `${this.firstName} ${this.lastName}`,
      netID: this.netID,
    };
  }
}

export default User;
