// @flow
import { MigrationInterface, QueryRunner } from 'typeorm';

// Sample migration that changes the netId field in user to net
class Change1521233644145 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner
            .query('ALTER TABLE "questions" RENAME COLUMN "canShare" TO "shared"');
    }

    async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner
            .query('ALTER TABLE "questions" RENAME COLUMN "shared" TO "canShare"');
    }
}

export default {
    Change1521233644145,
};
