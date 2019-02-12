// @flow
import { MigrationInterface, QueryRunner } from 'typeorm';

export class Change1549303297337 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner
            .query('ALTER TABLE "users" RENAME COLUMN "googleId" TO "googleID"');
        await queryRunner
            .query('ALTER TABLE "users" RENAME COLUMN "netId" TO "netID"');
        await queryRunner
            .query('ALTER TABLE "sessions" RENAME TO "groups"');
        await queryRunner
            .query('ALTER TABLE "sessions_admins_users_id" RENAME TO "groups_admins_users_id"');
        await queryRunner
            .query('ALTER TABLE "sessions_members_users_id" RENAME TO "groups_members_users_id"');
    }

    async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner
            .query('ALTER TABLE "users" RENAME COLUMN "googleID" TO "googleId"');
        await queryRunner
            .query('ALTER TABLE "users" RENAME COLUMN "netID" TO "netId"');
        await queryRunner
            .query('ALTER TABLE "groups" RENAME TO "sessions"');
        await queryRunner
            .query('ALTER TABLE "groups_admins_users_id" RENAME TO "sessions_admins_users_id"');
        await queryRunner
            .query('ALTER TABLE "groups_members_users_id" RENAME TO "sessions_members_users_id"');
    }
}
