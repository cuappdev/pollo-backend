// @flow
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany
} from 'typeorm';
import { Base } from './Base';
import { Session } from './Session';
import { User } from './User';

@Entity('groups')
export class Group extends Base {
  @PrimaryGeneratedColumn()
  id: any = null;

  @Column('string')
  name: string = '';

  @Column('string')
  code: string = '';

  @ManyToMany(type => User, user => user.adminGroups)
  admins: ?User[] = [];

  @OneToMany(type => Session, session => session.group)
  sessions: ?Session[] = [];

  @ManyToMany(type => User, user => user.memberGroups)
  members: ?User[] = [];
}
