// @flow
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  json
} from 'typeorm';
import { Base } from './Base';
import { Session } from './Session';
import { Group } from './Group';

@Entity('polls')
export class Poll extends Base {
  @PrimaryGeneratedColumn()
  id: any = null;

  @Column('string')
  text: string = '';

  @ManyToOne(type => Session, session => session.polls, {
    onDelete: 'CASCADE'
  })
  session: ?Session = null;

  @ManyToOne(type => Group, group => group.polls, {
    onDelete: 'CASCADE'
  })
  group: ?Group = null;

  @Column('json')
  results: json = {};

  @Column('boolean')
  shared: boolean = true;
}
