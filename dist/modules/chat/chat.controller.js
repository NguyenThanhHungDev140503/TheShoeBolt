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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ChatController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const clerk_auth_guard_1 = require("../Infracstructre/clerk/guards/clerk-auth.guard");
const chat_service_1 = require("./chat.service");
const create_chat_message_dto_1 = require("./dto/create-chat-message.dto");
const create_chat_room_dto_1 = require("./dto/create-chat-room.dto");
let ChatController = ChatController_1 = class ChatController {
    constructor(chatService) {
        this.chatService = chatService;
        this.logger = new common_1.Logger(ChatController_1.name);
    }
    async createRoom(createChatRoomDto, req) {
        this.logger.log(`Creating chat room by user ${req.user.id}`);
        return this.chatService.createRoom({
            ...createChatRoomDto,
            createdBy: req.user.id,
        });
    }
    async getUserRooms(req) {
        return this.chatService.getRoomsByUserId(req.user.id);
    }
    async getRoomById(id) {
        return this.chatService.getRoomById(id);
    }
    async createMessage(createChatMessageDto, req) {
        this.logger.log(`Creating chat message by user ${req.user.id} in room ${createChatMessageDto.roomId}`);
        return this.chatService.createMessage({
            ...createChatMessageDto,
            userId: req.user.id,
        });
    }
    async getRoomMessages(roomId, limit = 50, before) {
        await this.chatService.getRoomById(roomId);
        const beforeDate = before ? new Date(before) : undefined;
        return this.chatService.getMessagesByRoomId(roomId, limit, beforeDate);
    }
    async markMessagesAsRead(roomId, req) {
        await this.chatService.markMessagesAsRead(roomId, req.user.id);
        return { success: true };
    }
    async searchMessages(searchParams, req) {
        return this.chatService.searchMessages({
            userId: req.user.id,
            ...searchParams,
        });
    }
};
exports.ChatController = ChatController;
__decorate([
    (0, common_1.Post)('rooms'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new chat room' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'The chat room has been created' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_chat_room_dto_1.CreateChatRoomDto, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "createRoom", null);
__decorate([
    (0, common_1.Get)('rooms'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all chat rooms for the current user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns all chat rooms' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getUserRooms", null);
__decorate([
    (0, common_1.Get)('rooms/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a chat room by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns the chat room' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Chat room not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getRoomById", null);
__decorate([
    (0, common_1.Post)('messages'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new chat message' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'The chat message has been created' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_chat_message_dto_1.CreateChatMessageDto, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "createMessage", null);
__decorate([
    (0, common_1.Get)('rooms/:roomId/messages'),
    (0, swagger_1.ApiOperation)({ summary: 'Get messages for a chat room' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns chat messages' }),
    __param(0, (0, common_1.Param)('roomId')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('before')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getRoomMessages", null);
__decorate([
    (0, common_1.Post)('rooms/:roomId/read'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark all messages in a room as read' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Messages marked as read' }),
    __param(0, (0, common_1.Param)('roomId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "markMessagesAsRead", null);
__decorate([
    (0, common_1.Post)('search'),
    (0, swagger_1.ApiOperation)({ summary: 'Search chat messages' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns search results' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "searchMessages", null);
exports.ChatController = ChatController = ChatController_1 = __decorate([
    (0, swagger_1.ApiTags)('Chat'),
    (0, common_1.Controller)('chat'),
    (0, common_1.UseGuards)(clerk_auth_guard_1.ClerkAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatController);
//# sourceMappingURL=chat.controller.js.map