// @flow
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  json
} from 'typeorm';
import {Base} from './Base';
import {Question} from './Question';
import {User} from './User';
import {QUESTION_TYPE} from '../utils/constants';

@Entity('responses')
export class Response extends Base {
  @PrimaryGeneratedColumn()
  id: any = null;

  @Column('string')
  type: QUESTION_TYPE = '';

  // ex. For a ranking question {"answer": [3,1,4,2]}
  @Column('json')
  response: json = {};

  @ManyToOne(type => Question, question => question.responses)
  question: ?Question = null;

  @ManyToOne(type => User, user => user.responses)
  user: ?User = null;
}
