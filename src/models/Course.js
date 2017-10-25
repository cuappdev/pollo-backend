// @flow
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  OneToMany,
  ManyToOne
} from 'typeorm';
import {Base} from './Base';
import {User} from './User';
import {Lecture} from './Lecture';
import {Organization} from './Organization';

@Entity('courses')
export class Course extends Base {
  @PrimaryGeneratedColumn()
  id: any = null;

  @Column('string')
  name: string = '';

  @Column('string')
  term: string = '';

  @ManyToOne(type => Organization, organization => organization.courses)
  organization: ?Organization = null;

  @OneToMany(type => Lecture, lecture => lecture.course)
  lectures: ?Lecture[] = [];

  @ManyToMany(type => User, user => user.adminCourses, {
    cascadeAdd: true
  })
  admins: ?User[] = [];

  @ManyToMany(type => User, user => user.enrolledCourses, {
    cascadeAdd: true
  })
  students: ?User[] = [];
}
