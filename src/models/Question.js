// @flow
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  json
} from 'typeorm';
import {Base} from './Base';
import {Lecture} from './Lecture';
import {Response} from './Response';
import {QUESTION_TYPE} from '../utils/constants';

@Entity('questions')
export class Question extends Base {
  @PrimaryGeneratedColumn()
  id: any = null;

  @Column('string')
  text: string = '';

  @Column('string')
  type: QUESTION_TYPE = '';

  // contains choices, correct answer, etc.
  // ex. For a checkbox question {"choices": ["A","B","C","D"], "answer": ["A", "D"]}
  @Column('json', { nullable: true }) // null if question is open ended
  data: json = {};

  @ManyToOne(type => Lecture, lecture => lecture.questions)
  lecture: ?Lecture = null;

  @OneToMany(type => Response, response => response.question)
  responses: ?Response[] = [];
}
