// @flow
import {
  Column,
  Entity, JoinTable,
  ManyToOne, OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import uuidv4 from 'uuid/v4';
import Base from './Base';
import Draft from './Draft';
import Group from './Group';

import type { APIDraftCollection } from '../routers/v2/APITypes';

/**
 * DraftCollection class, represents an ordered collection of drafts
 * @extends {Base}
 */
@Entity('draftcollections')
class DraftCollection extends Base {
  /** Universally unique identifier */
  @PrimaryGeneratedColumn('uuid')
  uuid: string = uuidv4();

  /** Name of collection */
  @Column('character varying')
  name: string = '';

  /** Group who created the collection */
  @ManyToOne(type => Group, group => group.draftCollections, { onDelete: 'CASCADE' })
  group: ?Group = null;

  /** Drafts within the collection */
  @OneToMany(type => Draft, draft => draft.draftCollection, { cascade: ['insert', 'update'] })
  drafts: ?Draft[] = undefined;

  serialize(): APIDraftCollection {
    return {
      ...super.serialize(),
      id: this.uuid,
      name: this.name,
    };
  }
}

export default DraftCollection;
