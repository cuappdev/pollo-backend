// @flow
import {
  BeforeInsert, BeforeUpdate, Column,
} from 'typeorm';

/**
 * Base class, contains all fields that other classes have
 */
class Base {
  @Column('bigint')
  /** Created at timestamp (Unix time) */
  createdAt: string = '-1';

  @Column('bigint')
  /** Updated at timestamp (Unix time) */
  updatedAt: string = '-1';

  @BeforeInsert()
  /** Set the timestamps to current time
  * @function
  */
  setTimestamps(): void {
    const time = String(Math.floor(new Date().getTime() / 1000));
    this.createdAt = time;
    this.updatedAt = time;
  }

  @BeforeUpdate()
  /** Set updatedAt timestamp to current time
  * @function
  */
  updateTimestamps(): void {
    this.updatedAt = String(Math.floor(new Date().getTime() / 1000));
  }
}

export default Base;
