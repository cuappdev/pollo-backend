// @flow
import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeID1557207656455 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner
      .query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await queryRunner
      .query('ALTER TABLE "drafts" ADD COLUMN "uuid" uuid default uuid_generate_v4()');
    await queryRunner
      .query('ALTER TABLE "drafts" ADD CONSTRAINT "drafts_uuid" UNIQUE ("uuid")');
    await queryRunner
      .query('ALTER TABLE "groups" ADD COLUMN "uuid" uuid default uuid_generate_v4()');
    await queryRunner
      .query('ALTER TABLE "groups" ADD CONSTRAINT "groups_uuid" UNIQUE ("uuid")');
    await queryRunner
      .query('ALTER TABLE "polls" ADD COLUMN "uuid" uuid default uuid_generate_v4()');
    await queryRunner
      .query('ALTER TABLE "polls" ADD CONSTRAINT "polls_uuid" UNIQUE ("uuid")');
    await queryRunner
      .query('ALTER TABLE "users" ADD COLUMN "uuid" uuid default uuid_generate_v4()');
    await queryRunner
      .query('ALTER TABLE "users" ADD CONSTRAINT "users_uuid" UNIQUE ("uuid")');
    await queryRunner
      .query('ALTER TABLE "usersessions" ADD COLUMN "uuid" uuid default uuid_generate_v4()');
    await queryRunner
      .query('ALTER TABLE "usersessions" ADD CONSTRAINT "usersessions_uuid" UNIQUE ("uuid")');
  }

  async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner
      .query('ALTER TABLE "drafts" DROP COLUMN "uuid"');
    await queryRunner
      .query('ALTER TABLE "groups" DROP COLUMN "uuid"');
    await queryRunner
      .query('ALTER TABLE "polls" DROP COLUMN "uuid"');
    await queryRunner
      .query('ALTER TABLE "users" DROP COLUMN "uuid"');
    await queryRunner
      .query('ALTER TABLE "usersessions" DROP COLUMN "uuid"');
  }
}
