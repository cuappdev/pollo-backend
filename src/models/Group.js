// @flow
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany
} from 'typeorm';
import { Base } from './Base';
import { Poll } from './Poll';
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

  @OneToMany(type => Poll, poll => poll.group)
  polls: ?Poll[] = [];

  @ManyToMany(type => User, user => user.memberGroups)
  members: ?User[] = [];
}
