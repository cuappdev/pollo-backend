import { MigrationInterface, QueryRunner } from 'typeorm';

export class TestMigration implements MigrationInterface {
  async up (queryRunner: QueryRunner): Promise<any> {
    // await queryRunner.renameColumn('post', 'title', 'name');
    // alternatively you can do:
    // await queryRunner.query("ALTER TABLE `post` CHANGE `title` `name` VARCHAR(255)");
  }

  async down (queryRunner: QueryRunner): Promise<any> {
    // await queryRunner.renameColumn('post', 'name', 'title');
    // alternatively you can do:
    // await queryRunner.query("ALTER TABLE `post` CHANGE `name` `title` VARCHAR(255)");
  }
}
