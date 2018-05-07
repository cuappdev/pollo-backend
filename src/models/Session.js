// @flow
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable
} from 'typeorm';
import { Base } from './Base';
import { Poll } from './Poll';
import { Question } from './Question';
import { User } from './User';

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

  @OneToMany(type => Poll, poll => poll.session, {
    cascadeRemove: true
  })
  polls: ?Poll[] = [];

  @OneToMany(type => Question, question => question.session, {
    cascadeRemove: true
  })
  questions: ?Question[] = [];

  @ManyToMany(type => User, user => user.memberSessions)
  @JoinTable()
  members: ?User[] = [];
}
