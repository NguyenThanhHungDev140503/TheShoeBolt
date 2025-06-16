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
exports.CreateChatMessageDto = exports.AttachmentDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class AttachmentDto {
}
exports.AttachmentDto = AttachmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://storage.example.com/files/image.jpg' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AttachmentDto.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'image.jpg' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AttachmentDto.prototype, "filename", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'image/jpeg' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AttachmentDto.prototype, "contentType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1024 }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], AttachmentDto.prototype, "size", void 0);
class CreateChatMessageDto {
}
exports.CreateChatMessageDto = CreateChatMessageDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '507f1f77bcf86cd799439011' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateChatMessageDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '507f1f77bcf86cd799439012' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateChatMessageDto.prototype, "roomId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Hello, how are you?' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateChatMessageDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [AttachmentDto], required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => AttachmentDto),
    __metadata("design:type", Array)
], CreateChatMessageDto.prototype, "attachments", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false, required: false, default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateChatMessageDto.prototype, "isRead", void 0);
//# sourceMappingURL=create-chat-message.dto.js.map