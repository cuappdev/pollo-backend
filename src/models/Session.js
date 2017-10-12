// @flow
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn
} from 'typeorm';
import {Base} from './Base';
import {User} from './User';

import crypto from 'crypto';

@Entity('sessions')
export class Session extends Base {
  @PrimaryGeneratedColumn()
  id: any = null; // hacky b/c https://github.com/babel/babel/issues/5519

  @Column('string')
  sessionToken: string = '';

  @Column('bigint')
  expiresAt: number = -1;

  @Column('string')
  updateToken: string = '';

  @Column('boolean')
  isActive: boolean = true;

  @OneToOne(type => User)
  @JoinColumn()
  user: ?User = null;

  static fromUser (user: User): Session {
    const session = new Session();
    session.update();
    session.user = user;
    return session;
  }

  update (): Session {
    this.sessionToken = crypto.randomBytes(64).toString('hex');
    this.updateToken = crypto.randomBytes(64).toString('hex');
    this.expiresAt = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24 * 7;
    this.activate();
    return this;
  }

  activate (): Session {
    this.isActive = true;
    return this;
  }

  logOut (): Session {
    this.isActive = false;
    return this;
  }
}
