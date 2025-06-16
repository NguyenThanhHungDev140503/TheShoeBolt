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
exports.ChatMessageSchema = exports.ChatMessage = exports.Attachment = void 0;
const mongoose_1 = require("@nestjs/mongoose");
class Attachment {
}
exports.Attachment = Attachment;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Attachment.prototype, "url", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Attachment.prototype, "filename", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Attachment.prototype, "contentType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Attachment.prototype, "size", void 0);
let ChatMessage = class ChatMessage {
};
exports.ChatMessage = ChatMessage;
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], ChatMessage.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], ChatMessage.prototype, "roomId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ChatMessage.prototype, "content", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [Object], default: [] }),
    __metadata("design:type", Array)
], ChatMessage.prototype, "attachments", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], ChatMessage.prototype, "isRead", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], ChatMessage.prototype, "createdAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], ChatMessage.prototype, "updatedAt", void 0);
exports.ChatMessage = ChatMessage = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], ChatMessage);
exports.ChatMessageSchema = mongoose_1.SchemaFactory.createForClass(ChatMessage);
exports.ChatMessageSchema.index({ roomId: 1, createdAt: -1 });
//# sourceMappingURL=chat-message.schema.js.map