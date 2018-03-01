// @flow
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany
} from 'typeorm';
import {Base} from './Base';
import { Question } from './Question';

@Entity('polls')
export class Poll extends Base {
  @PrimaryGeneratedColumn()
  id: any = null;

  @Column('string')
  name: string = '';

  @Column('string')
  code: string = '';

  @OneToMany(type => Question, question => question.poll)
  questions: ?Question[] = [];
}
