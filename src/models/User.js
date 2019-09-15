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

@Entity('users')
/**
 * User class represents a user on the application.
 * @extends {Base}
 */
class User extends Base {
  @PrimaryGeneratedColumn()
  /** Unique identifier */
  id: any = null;

  @Column('character varying')
  /** Google ID of user */
  googleID: string = '';

  @Column('character varying')
  /** Net ID of user */
  netID: string = '';

  @Column('character varying')
  /** Email of user */
  email: string = '';

  @Column('character varying')
  /** User first name */
  firstName: string = '';

  @Column('character varying')
  /** User last name */
  lastName: string = '';

  @ManyToMany(type => Group, group => group.admins)
  /** Groups that the user is an admin of */
  adminGroups: ?Group[] = undefined;

  @ManyToMany(type => Group, group => group.members)
  /** Groups that the user is a member of */
  memberGroups: ?Group[] = undefined;

  @OneToMany(type => Question, question => question.user)
  /** Questions that a user has asked */
  questions: ?Question[] = undefined;

  @OneToMany(type => Draft, draft => draft.user)
  /** Drafts that a user has created */
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
