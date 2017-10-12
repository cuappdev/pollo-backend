// @flow
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  OneToMany
} from 'typeorm';
import {Base} from './Base';
import {Course} from './Course';
import {Response} from './Response';

@Entity('users')
export class User extends Base {
  @PrimaryGeneratedColumn()
  id: any = null; // hacky b/c https://github.com/babel/babel/issues/5519

  @Column('string')
  googleId: string = '';

  @Column('string')
  netId: string = '';

  @Column('string')
  firstName: string = '';

  @Column('string')
  lastName: string = '';

  @Column('string')
  email: string = '';

  @ManyToMany(type => Course, course => course.students)
  @JoinTable()
  enrolledCourses: ?Course[] = [];

  @ManyToMany(type => Course, course => course.admins)
  @JoinTable()
  adminCourses: ?Course[] = []; // Courses user is an admin of

  @OneToMany(type => Response, response => response.user)
  responses: ?Response[] = [];

  static fromGoogleCreds (creds: Object): User {
    const user = new User();
    user.googleId = creds.googleId;
    user.netId = creds.netId;
    user.firstName = creds.firstName;
    user.lastName = creds.lastName;
    user.email = creds.email;
    return user;
  }
}
