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
import Group from './Group';
import appDevUtils from '../utils/AppDevUtils';

/**
 * User class represents a user on the application.
 * @extends {Base}
 */
@Entity('users')
class User extends Base {
  /** Unique identifier */
  @PrimaryGeneratedColumn()
  id: any = null;

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
}

export default User;
