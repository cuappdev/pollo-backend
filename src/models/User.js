// @flow
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable
} from 'typeorm';
import { Base } from './Base';
import { Poll } from './Poll';
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

  @ManyToMany(type => Poll, poll => poll.admins)
  adminPolls: ?Poll[] = [];

  @ManyToMany(type => Poll, poll => poll.members)
  memberPolls: ?Poll[] = [];

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
