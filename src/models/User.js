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
import Session from './Session';
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

  @Column('string')
  /** Google ID of user */
  googleId: string = '';

  @Column('string')
  /** Net ID of user */
  netId: string = '';

  @Column('string')
  /** Email of user */
  email: string = '';

  @Column('string')
  /** User first name */
  firstName: string = '';

  @Column('string')
  /** User last name */
  lastName: string = '';

  @ManyToMany(type => Session, session => session.admins)
  /** Sessions that the user is an admin of */
  adminSessions: ?Session[] = [];

  @ManyToMany(type => Session, session => session.members)
  /** Sessions that the user is a member of */
  memberSessions: ?Session[] = [];

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
      user.googleId = id;
      user.firstName = '';
      user.lastName = '';
      user.email = '';
      user.netId = '';
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
      user.googleId = creds.id;
      user.firstName = creds.name.givenName;
      user.lastName = creds.name.familyName;
      user.email = creds.emails[0].value;
      user.netId = appDevUtils.netIdFromEmail(user.email);
      return user;
  }
}

export default User;
