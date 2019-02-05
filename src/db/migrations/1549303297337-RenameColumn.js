// @flow
import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameColumn1549303297337 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner
            .query('ALTER TABLE "users" RENAME COLUMN "googleId" TO "googleID"');
        await queryRunner
            .query('ALTER TABLE "users" RENAME COLUMN "netId" TO "netID"');
    }

    async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner
            .query('ALTER TABLE "users" RENAME COLUMN "googleID" TO "googleId"');
        await queryRunner
            .query('ALTER TABLE "users" RENAME COLUMN "netID" TO "netId"');
    }
}
