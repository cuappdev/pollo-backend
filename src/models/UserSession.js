// @flow
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
import crypto from 'crypto';
import Base from './Base';
import User from './User';

export default @Entity('usersessions') class UserSession extends Base {
  @PrimaryGeneratedColumn()
  id: any = null;

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

  static fromUser(user: User, accessToken: ?string, refreshToken: ?string):
    UserSession {
    const session = new UserSession();
    session.user = user;
    session.update(accessToken, refreshToken);
    return session;
  }

  update(accessToken: ?string, updateToken: ?string): UserSession {
    this.sessionToken = accessToken || crypto.randomBytes(64).toString('hex');
    this.updateToken = updateToken || crypto.randomBytes(64).toString('hex');

    // Session length is 1 day
    this.expiresAt = Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24;
    this.activate();
    return this;
  }

  activate(): UserSession {
    this.isActive = true;
    return this;
  }

  logOut(): UserSession {
    this.isActive = false;
    return this;
  }
}
