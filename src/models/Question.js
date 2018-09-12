// @flow
import {
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import Base from './Base';
import Session from './Session';
import User from './User';

export default @Entity('questions') class Question extends Base {
  @PrimaryGeneratedColumn()
  id: any = null;

  @Column('string')
  text: string = '';

  @ManyToOne(type => Session, session => session.polls, {
      onDelete: 'CASCADE',
  })
  session: ?Session = null;

  @ManyToOne(type => User, user => user.questions)
  user: ?User = null;
}
