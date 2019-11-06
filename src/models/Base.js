// @flow
import {
  BeforeInsert, BeforeUpdate, Column,
} from 'typeorm';

/** Base class, contains all fields that other classes have */
class Base {
  /** Created at timestamp (Unix time) */
  @Column('bigint')
  createdAt: string = '-1';

  /** Updated at timestamp (Unix time) */
  @Column('bigint')
  updatedAt: string = '-1';

  /**
   * Set the timestamps to current time
   * @function
   */
  @BeforeInsert()
  setTimestamps(): void {
    const time = String(Math.floor(new Date().getTime() / 1000));
    this.createdAt = time;
    this.updatedAt = time;
  }

  /**
   * Set updatedAt timestamp to current time
   * @function
   */
  @BeforeUpdate()
  updateTimestamps(): void {
    this.updatedAt = String(Math.floor(new Date().getTime() / 1000));
  }

  serialize() {
    return {
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export default Base;
