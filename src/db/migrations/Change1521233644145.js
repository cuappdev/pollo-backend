// @flow
import { MigrationInterface, QueryRunner } from 'typeorm';

// Sample migration that changes the netID field in user to net
class Change1521233644145 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner
            .query('ALTER TABLE "users" RENAME COLUMN "googleId" TO "googleID"');
    }

    async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner
            .query('ALTER TABLE "users" RENAME COLUMN "googleID" TO "googleId"');
    }
}

export default {
    Change1521233644145,
};
