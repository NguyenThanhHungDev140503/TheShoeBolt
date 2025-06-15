import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFileUploadAndAudit1703002000000 implements MigrationInterface {
  name = 'AddFileUploadAndAudit1703002000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create file types enum
    await queryRunner.query(`
      CREATE TYPE "public"."files_type_enum" AS ENUM('image', 'document', 'video', 'audio', 'other')
    `);

    // Create files table
    await queryRunner.query(`
      CREATE TABLE "files" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "originalName" character varying NOT NULL,
        "filename" character varying NOT NULL,
        "mimetype" character varying NOT NULL,
        "size" bigint NOT NULL,
        "path" character varying NOT NULL,
        "url" character varying NOT NULL,
        "type" "public"."files_type_enum" NOT NULL,
        "userId" uuid,
        "metadata" jsonb,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_6c16b9093a142e0e7613b04a3d9" PRIMARY KEY ("id")
      )
    `);

    // Create audit action enum
    await queryRunner.query(`
      CREATE TYPE "public"."audit_logs_action_enum" AS ENUM(
        'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 
        'PAYMENT', 'EMAIL_SENT', 'FILE_UPLOAD', 'SECURITY_VIOLATION'
      )
    `);

    // Create audit_logs table
    await queryRunner.query(`
      CREATE TABLE "audit_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid,
        "action" "public"."audit_logs_action_enum" NOT NULL,
        "entityType" character varying NOT NULL,
        "entityId" character varying,
        "oldValues" jsonb,
        "newValues" jsonb,
        "metadata" jsonb,
        "ipAddress" character varying NOT NULL,
        "userAgent" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_258ef1abac05413b2d988862260" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "files" 
      ADD CONSTRAINT "FK_files_user_id" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    // Create indexes for better performance
    await queryRunner.query(`CREATE INDEX "IDX_files_user_id" ON "files" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_files_type" ON "files" ("type")`);
    await queryRunner.query(`CREATE INDEX "IDX_files_created_at" ON "files" ("createdAt")`);
    await queryRunner.query(`CREATE INDEX "IDX_files_is_active" ON "files" ("isActive")`);

    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_user_id" ON "audit_logs" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_action" ON "audit_logs" ("action")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_entity_type" ON "audit_logs" ("entityType")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_entity_id" ON "audit_logs" ("entityId")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_created_at" ON "audit_logs" ("createdAt")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_user_created" ON "audit_logs" ("userId", "createdAt")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_entity_type_id" ON "audit_logs" ("entityType", "entityId")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_action_created" ON "audit_logs" ("action", "createdAt")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "public"."IDX_audit_action_created"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_audit_entity_type_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_audit_user_created"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_audit_logs_created_at"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_audit_logs_entity_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_audit_logs_entity_type"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_audit_logs_action"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_audit_logs_user_id"`);
    
    await queryRunner.query(`DROP INDEX "public"."IDX_files_is_active"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_files_created_at"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_files_type"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_files_user_id"`);
    
    // Drop foreign key constraints
    await queryRunner.query(`ALTER TABLE "files" DROP CONSTRAINT "FK_files_user_id"`);
    
    // Drop tables
    await queryRunner.query(`DROP TABLE "audit_logs"`);
    await queryRunner.query(`DROP TABLE "files"`);
    
    // Drop enums
    await queryRunner.query(`DROP TYPE "public"."audit_logs_action_enum"`);
    await queryRunner.query(`DROP TYPE "public"."files_type_enum"`);
  }
}