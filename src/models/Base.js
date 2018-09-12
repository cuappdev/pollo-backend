// @flow
import {
    AbstractEntity, BeforeInsert, BeforeUpdate, Column,
} from 'typeorm';

export default @AbstractEntity() class Base {
  @Column('bigint')
  createdAt: number = -1;

  @Column('bigint')
  updatedAt: number = -1;

  @BeforeInsert()
  setTimestamps() : void {
      const time = Math.floor(new Date().getTime() / 1000);
      this.createdAt = time;
      this.updatedAt = time;
  }

  @BeforeUpdate()
  updateTimestamps() : void {
      this.updatedAt = Math.floor(new Date().getTime() / 1000);
  }
}
