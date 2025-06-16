import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddClerkIdToUsers1717757565123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "clerk_id" character varying NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "clerk_id"`);
  }
} 