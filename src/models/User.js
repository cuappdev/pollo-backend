// @flow
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  OneToMany,
  JoinTable
} from 'typeorm';
import { Draft } from './Draft';
import { Base } from './Base';
import { Session } from './Session';
import { Group } from './Group';
import appDevUtils from '../utils/appDevUtils';

@Entity('users')
export class User extends Base {
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

  @ManyToMany(type => Group, group => group.admins)
  @JoinTable()
  adminGroups: ?Group[] = [];

  @ManyToMany(type => Group, group => group.members)
  @JoinTable()
  memberGroups: ?Group[] = [];

  @OneToMany(type => Draft, draft => draft.user)
  drafts: ?Draft[] = [];

  static dummy (id: string): User {
    const user = new User();
    user.googleId = id;
    user.firstName = '';
    user.lastName = '';
    user.email = '';
    user.netId = '';
    return user;
  }

  static fromGoogleCreds (creds: Object): User {
    const user = new User();
    user.googleId = creds.id;
    user.firstName = creds.name.givenName;
    user.lastName = creds.name.familyName;
    user.email = creds.emails[0].value;
    user.netId = appDevUtils.netIdFromEmail(user.email);
    return user;
  }
}
