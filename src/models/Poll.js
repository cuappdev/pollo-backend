// @flow
import {
    Column,
    Entity,
    json,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import Base from './Base';
import Session from './Session';

export default @Entity('polls') class Poll extends Base {
  @PrimaryGeneratedColumn()
  id: any = null;

  @Column('string')
  text: string = '';

  @Column('string')
  type: string = ''; // Either MULTIPLE_CHOICE OR FREE_RESPONSE

  @ManyToOne(type => Session, session => session.polls, {
      onDelete: 'CASCADE',
  })
  session: ?Session = null;

  @Column('json')
  results: json = {}; // Ex. {'A': {'text': 'blue', 'count': 0}}

  // Google ids mapped to answer choice
  @Column('json')
  userAnswers: json = {};

  @Column('boolean')
  shared: boolean = true;
}
