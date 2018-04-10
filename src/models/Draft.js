// @flow
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne
} from 'typeorm';
import { Base } from './Base';
import { Session } from './Session';
import { User } from './User';

@Entity('drafts')
export class Draft extends Base {
  @PrimaryGeneratedColumn()
  id: any = null;

  @Column('string')
  text: string = '';

  @Column('json')
  options: string[] = [];

  @ManyToOne(type => User, user => user.drafts)
  user: ?User = null;
}
