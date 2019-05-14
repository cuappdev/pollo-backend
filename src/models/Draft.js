// @flow
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import Base from './Base';
import User from './User';

import type { APIDraft } from '../routers/v2/APITypes';

@Entity('drafts')
/**
 * Draft class, represents drafts of polls
 * @extends {Base}
 */
class Draft extends Base {
  @PrimaryGeneratedColumn()
  /** Unique identifier */
  id: any = null;

  @Column('string')
  /** Text of question */
  text: string = '';

  @Column('json')
  /** Options of question, empty for FR */
  options: string[] = [];

  @ManyToOne(type => User, user => user.drafts)
  /** User the draft belongs to */
  user: ?User = null;

  serialize(): APIDraft {
    return {
      ...super.serialize(),
      options: this.options,
      text: this.text,
    };
  }
}

export default Draft;
