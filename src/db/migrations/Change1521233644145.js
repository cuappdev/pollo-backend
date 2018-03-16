// @flow
import { MigrationInterface, QueryRunner } from 'typeorm';

// Sample migration that changes the netId field in user to net
export class Change1521233644145 implements MigrationInterface {
  async up (queryRunner: QueryRunner): Promise<any> {
    await queryRunner
      .query('ALTER TABLE "users" RENAME COLUMN "netId" TO "net"');
  }

  async down (queryRunner: QueryRunner): Promise<any> {
    await queryRunner
      .query('ALTER TABLE "users" RENAME COLUMN "net" TO "netId"');
  }
}
