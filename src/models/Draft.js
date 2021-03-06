// @flow
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import uuidv4 from 'uuid/v4';
import Base from './Base';
import User from './User';

import type { APIDraft } from '../routers/v2/APITypes';

/**
 * Draft class, represents drafts of polls
 * @extends {Base}
 */
@Entity('drafts')
class Draft extends Base {
  /** Universally unique identifier */
  @PrimaryGeneratedColumn('uuid')
  uuid: string = uuidv4();

  /** Text of question */
  @Column('character varying')
  text: string = '';

  /** Options of question */
  @Column('json')
  options: string[];

  /** User the draft belongs to */
  @ManyToOne(type => User, user => user.drafts)
  user: ?User = null;

  serialize(): APIDraft {
    return {
      ...super.serialize(),
      id: this.uuid,
      options: this.options,
      text: this.text,
    };
  }
}

export default Draft;
