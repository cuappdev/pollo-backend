// @flow
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import Base from './Base';
import User from './User';

/**
 * Draft class, represents drafts of polls
 * @extends {Base}
 */
@Entity('drafts')
class Draft extends Base {
  /** Unique identifier */
  @PrimaryGeneratedColumn()
  id: any = null;

  /** Text of question */
  @Column('string')
  text: string = '';

  /** Options of question, empty for FR */
  @Column('json')
  options: string[] = [];

  /** User the draft belongs to */
  @ManyToOne(type => User, user => user.drafts)
  user: ?User = null;
}

export default Draft;
