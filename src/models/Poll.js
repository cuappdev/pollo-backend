// @flow
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany
} from 'typeorm';
import { Base } from './Base';
import { Question } from './Question';
import { User } from './User';

@Entity('polls')
export class Poll extends Base {
  @PrimaryGeneratedColumn()
  id: any = null;

  @Column('string')
  name: string = '';

  @Column('string')
  code: string = '';

  @ManyToMany(type => User, user => user.myPolls)
  admins: ?User[] = [];

  @Column('string')
  adminId: string = '';

  @OneToMany(type => Question, question => question.poll)
  questions: ?Question[] = [];

  @ManyToMany(type => User, user => user.polls)
  users: ?User[] = [];
}
