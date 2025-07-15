"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSession = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
let UserSession = class UserSession {
    isActive() {
        return this.endedAt === null;
    }
    getDuration() {
        if (!this.endedAt) {
            return Date.now() - this.createdAt.getTime();
        }
        return this.endedAt.getTime() - this.createdAt.getTime();
    }
    updateLastActivity() {
        this.lastActivity = new Date();
    }
    endSession() {
        this.endedAt = new Date();
    }
};
exports.UserSession = UserSession;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], UserSession.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'clerk_session_id', unique: true }),
    __metadata("design:type", String)
], UserSession.prototype, "clerkSessionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'uuid' }),
    __metadata("design:type", String)
], UserSession.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], UserSession.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], UserSession.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ended_at', nullable: true }),
    __metadata("design:type", Date)
], UserSession.prototype, "endedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_activity', nullable: true }),
    __metadata("design:type", Date)
], UserSession.prototype, "lastActivity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ip_address', type: 'inet', nullable: true }),
    __metadata("design:type", String)
], UserSession.prototype, "ipAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_agent', type: 'text', nullable: true }),
    __metadata("design:type", String)
], UserSession.prototype, "userAgent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true, name: 'session_metadata' }),
    __metadata("design:type", Object)
], UserSession.prototype, "sessionMetadata", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], UserSession.prototype, "updatedAt", void 0);
exports.UserSession = UserSession = __decorate([
    (0, typeorm_1.Entity)('user_sessions'),
    (0, typeorm_1.Index)(['clerkSessionId'], { unique: true }),
    (0, typeorm_1.Index)(['userId', 'endedAt']),
    (0, typeorm_1.Index)(['createdAt'])
], UserSession);
//# sourceMappingURL=user-session.entity.js.map