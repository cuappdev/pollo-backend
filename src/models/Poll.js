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
import { Question } from './Question';
import { User } from './User';
import { Group } from './Group';

@Entity('polls')
export class Poll extends Base {
  @PrimaryGeneratedColumn()
  id: any = null;

  @Column('string')
  name: string = '';

  @Column('string')
  code: string = '';

  @ManyToMany(type => User, user => user.adminPolls)
  @JoinTable()
  admins: ?User[] = [];

  @OneToMany(type => Question, question => question.poll)
  questions: ?Question[] = [];

  @ManyToMany(type => User, user => user.memberPolls)
  @JoinTable()
  members: ?User[] = [];

  @ManyToOne(type => Group, group => group.polls)
  group: ?Group = null;
}
