"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddClerkIdToUsers1717757565123 = void 0;
class AddClerkIdToUsers1717757565123 {
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "clerk_id" character varying NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "clerk_id"`);
    }
}
exports.AddClerkIdToUsers1717757565123 = AddClerkIdToUsers1717757565123;
//# sourceMappingURL=1717757565123-add-clerk-id-to-users.js.map