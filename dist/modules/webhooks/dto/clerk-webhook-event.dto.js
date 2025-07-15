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
exports.WebhookEventDto = exports.ClerkOrganizationMembershipEventDto = exports.ClerkOrganizationEventDto = exports.ClerkSessionEventDto = exports.ClerkUserEventDto = exports.LastActiveDto = exports.EmailAddressDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class EmailAddressDto {
}
exports.EmailAddressDto = EmailAddressDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Email address ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EmailAddressDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Email address value' }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], EmailAddressDto.prototype, "email_address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether this is the primary email' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], EmailAddressDto.prototype, "primary", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Verification status' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], EmailAddressDto.prototype, "verification", void 0);
class LastActiveDto {
}
exports.LastActiveDto = LastActiveDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Timestamp of last activity' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LastActiveDto.prototype, "timestamp", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'IP address of last activity' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LastActiveDto.prototype, "ip_address", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'User agent of last activity' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LastActiveDto.prototype, "user_agent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'City of last activity' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LastActiveDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Country of last activity' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LastActiveDto.prototype, "country", void 0);
class ClerkUserEventDto {
}
exports.ClerkUserEventDto = ClerkUserEventDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Clerk user ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ClerkUserEventDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User email addresses', type: [EmailAddressDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => EmailAddressDto),
    __metadata("design:type", Array)
], ClerkUserEventDto.prototype, "email_addresses", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'User first name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ClerkUserEventDto.prototype, "first_name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'User last name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ClerkUserEventDto.prototype, "last_name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Profile image URL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], ClerkUserEventDto.prototype, "profile_image_url", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Public metadata' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], ClerkUserEventDto.prototype, "public_metadata", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Private metadata' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], ClerkUserEventDto.prototype, "private_metadata", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User creation timestamp' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ClerkUserEventDto.prototype, "created_at", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User last update timestamp' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ClerkUserEventDto.prototype, "updated_at", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'User username' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ClerkUserEventDto.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'User phone numbers' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], ClerkUserEventDto.prototype, "phone_numbers", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'External accounts' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], ClerkUserEventDto.prototype, "external_accounts", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Last sign in timestamp' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ClerkUserEventDto.prototype, "last_sign_in_at", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Whether user is banned' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], ClerkUserEventDto.prototype, "banned", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Whether user is locked' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], ClerkUserEventDto.prototype, "locked", void 0);
class ClerkSessionEventDto {
}
exports.ClerkSessionEventDto = ClerkSessionEventDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Clerk session ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ClerkSessionEventDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID associated with session' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ClerkSessionEventDto.prototype, "user_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Session creation timestamp' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ClerkSessionEventDto.prototype, "created_at", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Session last update timestamp' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ClerkSessionEventDto.prototype, "updated_at", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Last active information', type: LastActiveDto }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => LastActiveDto),
    __metadata("design:type", LastActiveDto)
], ClerkSessionEventDto.prototype, "last_active_at", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Session status' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ClerkSessionEventDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Session expiration timestamp' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ClerkSessionEventDto.prototype, "expire_at", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Session abandonment timestamp' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ClerkSessionEventDto.prototype, "abandon_at", void 0);
class ClerkOrganizationEventDto {
}
exports.ClerkOrganizationEventDto = ClerkOrganizationEventDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Clerk organization ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ClerkOrganizationEventDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Organization name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ClerkOrganizationEventDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Organization slug' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ClerkOrganizationEventDto.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Organization creation timestamp' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ClerkOrganizationEventDto.prototype, "created_at", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Organization last update timestamp' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ClerkOrganizationEventDto.prototype, "updated_at", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Public metadata' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], ClerkOrganizationEventDto.prototype, "public_metadata", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Private metadata' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], ClerkOrganizationEventDto.prototype, "private_metadata", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Organization logo URL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], ClerkOrganizationEventDto.prototype, "logo_url", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Maximum allowed members' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ClerkOrganizationEventDto.prototype, "max_allowed_memberships", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Admin delete enabled' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], ClerkOrganizationEventDto.prototype, "admin_delete_enabled", void 0);
class ClerkOrganizationMembershipEventDto {
}
exports.ClerkOrganizationMembershipEventDto = ClerkOrganizationMembershipEventDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Membership ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ClerkOrganizationMembershipEventDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Organization information' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], ClerkOrganizationMembershipEventDto.prototype, "organization", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Public user data' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], ClerkOrganizationMembershipEventDto.prototype, "public_user_data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Member role' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ClerkOrganizationMembershipEventDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Membership creation timestamp' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ClerkOrganizationMembershipEventDto.prototype, "created_at", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Membership last update timestamp' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ClerkOrganizationMembershipEventDto.prototype, "updated_at", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Public metadata' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], ClerkOrganizationMembershipEventDto.prototype, "public_metadata", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Private metadata' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], ClerkOrganizationMembershipEventDto.prototype, "private_metadata", void 0);
class WebhookEventDto {
}
exports.WebhookEventDto = WebhookEventDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Event type' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WebhookEventDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Event data - varies by event type' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], WebhookEventDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Event object type' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WebhookEventDto.prototype, "object", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Event timestamp' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], WebhookEventDto.prototype, "timestamp", void 0);
//# sourceMappingURL=clerk-webhook-event.dto.js.map