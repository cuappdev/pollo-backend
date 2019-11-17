import {MigrationInterface, QueryRunner} from "typeorm";

export class removefr1573839312713 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner
            .query('ALTER TABLE "polls" DROP COLUMN "type"');
        await queryRunner
            .query('ALTER TABLE "polls" DROP COLUMN "upvotes"');
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner
            .query('ALTER TABLE "polls" ADD COLUMN "type" varchar');
            await queryRunner
            .query('ALTER TABLE "polls" ADD COLUMN "upvotes" json');
    }

}
