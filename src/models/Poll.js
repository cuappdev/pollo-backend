// @flow
import {
  Entity,
  PrimaryGeneratedColumn,
  Column
} from 'typeorm';
import {Base} from './Base';

@Entity('polls')
export class Poll extends Base {
  @PrimaryGeneratedColumn()
  id: any = null;

  @Column('string')
  name: string = '';

  @Column('string')
  code: string = '';
}
