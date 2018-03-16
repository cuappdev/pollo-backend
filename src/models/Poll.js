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

  @ManyToMany(type => User)
  @JoinTable()
  admins: ?User[] = [];

  @OneToMany(type => Question, question => question.poll)
  questions: ?Question[] = [];

  @ManyToMany(type => User)
  @JoinTable()
  users: ?User[] = [];
}
