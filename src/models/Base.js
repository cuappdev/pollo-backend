// @flow
import { AbstractEntity, Column, BeforeInsert, BeforeUpdate } from 'typeorm';

@AbstractEntity()
export class Base {
  @Column('bigint')
  createdAt: number = -1;

  @Column('bigint')
  updatedAt: number = -1;

  @BeforeInsert()
  setTimestamps () : void {
    this.createdAt = this.updatedAt = Math.floor(new Date().getTime() / 1000);
  }

  @BeforeUpdate()
  updateTimestamps () : void {
    this.updatedAt = Math.floor(new Date().getTime() / 1000);
  }
}
