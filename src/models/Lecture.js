// @flow
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany
} from 'typeorm';
import {Base} from './Base';
import {Course} from './Course';
import {Question} from './Question';

@Entity('lectures')
export class Lecture extends Base {
  @PrimaryGeneratedColumn()
  id: any = null;

  @Column('bigint')
  dateTime: number = -1; // Date & time of lecture

  @ManyToOne(type => Course, course => course.lectures)
  course: ?Course = null;

  @OneToMany(type => Question, question => question.lecture)
  questions: ?Question[] = [];
}
