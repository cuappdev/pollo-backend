// @flow
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany
} from 'typeorm';
import {Base} from './Base';
import {Course} from './Course';

@Entity('organizations')
export class Organization extends Base {
  @PrimaryGeneratedColumn()
  id: any = null;

  @Column('string')
  name: string = '';

  @OneToMany(type => Course, course => course.organization)
  courses: ?Course[] = [];
}
