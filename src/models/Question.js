// @flow
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  json
} from 'typeorm';
import { Base } from './Base';
import { Poll } from './Poll';

@Entity('questions')
export class Question extends Base {
  @PrimaryGeneratedColumn()
  id: any = null;

  @Column('string')
  text: string = '';

  @ManyToOne(type => Poll, poll => poll.questions, {
    onDelete: 'CASCADE'
  })
  poll: ?Poll = null;

  @Column('json')
  results: json = {};

  @Column('boolean')
  canShare: boolean = true;
}
