// @flow
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
import Base from './Base';
import User from './User';

export default @Entity('drafts') class Draft extends Base {
  @PrimaryGeneratedColumn()
  id: any = null;

  @Column('string')
  text: string = '';

  @Column('json')
  options: string[] = [];

  @ManyToOne(type => User, user => user.drafts)
  user: ?User = null;
}
