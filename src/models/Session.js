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

  static fromUser (user: User, accessToken: ?string, refreshToken: ?string):
    Session {
    const session = new Session();
    session.user = user;
    session.update(accessToken, refreshToken);
    return session;
  }

  update (accessToken: ?string, updateToken: ?string): Session {
    if (accessToken) {
      this.sessionToken = accessToken;
    } else {
      this.sessionToken = crypto.randomBytes(64).toString('hex');
    }
    if (updateToken) {
      this.updateToken = updateToken;
    } else {
      this.updateToken = crypto.randomBytes(64).toString('hex');
    }
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
