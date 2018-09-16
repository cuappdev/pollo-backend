// @flow
import {
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import Base from './Base';
import Poll from './Poll';
import Question from './Question';
import User from './User';

@Entity('sessions')
/**
 * Session class represents a grouping of polls.
 * @extends {Base}
 */
class Session extends Base {
  @PrimaryGeneratedColumn()
  /** Unique identifier */
  id: any = null;

  @Column('string')
  /** Name of session */
  name: string = '';

  @Column('string')
  /** Unique code to join session */
  code: string = '';

  @ManyToMany(type => User, user => user.adminSessions)
  @JoinTable()
  /** Admins of the session */
  admins: ?User[] = [];

  @OneToMany(type => Poll, poll => poll.session, {
      cascadeRemove: true,
  })
  /** Polls belonging to the session */
  polls: ?Poll[] = [];

  @OneToMany(type => Question, question => question.session, {
      cascadeRemove: true,
  })
  /** Questions belonging to the session */
  questions: ?Question[] = [];

  @ManyToMany(type => User, user => user.memberSessions)
  @JoinTable()
  /** Member of the session */
  members: ?User[] = [];
}

export default Session;
