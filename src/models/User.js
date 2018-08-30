// @flow
import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm';
import Base from './Base';
import Draft from './Draft';
import Question from './Question';
import Session from './Session';
import appDevUtils from '../utils/appDevUtils';

export default @Entity('users') class User extends Base {
  @PrimaryGeneratedColumn()
  id: any = null;

  @Column('string')
  googleId: string = '';

  @Column('string')
  netId: string = '';

  @Column('string')
  email: string = '';

  @Column('string')
  firstName: string = '';

  @Column('string')
  lastName: string = '';

  @ManyToMany(type => Session, session => session.admins)
  adminSessions: ?Session[] = [];

  @ManyToMany(type => Session, session => session.members)
  memberSessions: ?Session[] = [];

  @OneToMany(type => Question, question => question.user)
  questions: ?Question[] = [];

  @OneToMany(type => Draft, draft => draft.user)
  drafts: ?Draft[] = [];

  static dummy(id: string): User {
    const user = new User();
    user.googleId = id;
    user.firstName = '';
    user.lastName = '';
    user.email = '';
    user.netId = '';
    return user;
  }

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
