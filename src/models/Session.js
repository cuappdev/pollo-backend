// @flow
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
  ManyToOne
} from 'typeorm';
import { Base } from './Base';
import { Poll } from './Poll';
import { User } from './User';
import { Group } from './Group';

@Entity('sessions')
export class Session extends Base {
  @PrimaryGeneratedColumn()
  id: any = null;

  @Column('string')
  name: string = '';

  @Column('string')
  code: string = '';

  @ManyToMany(type => User, user => user.adminSessions)
  @JoinTable()
  admins: ?User[] = [];

  @OneToMany(type => Poll, poll => poll.session)
  polls: ?Poll[] = [];

  @ManyToMany(type => User, user => user.memberSessions)
  @JoinTable()
  members: ?User[] = [];

  @ManyToOne(type => Group, group => group.sessions)
  group: ?Group = null;
}
