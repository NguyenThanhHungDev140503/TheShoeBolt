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
var ChatService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const chat_message_schema_1 = require("./schemas/chat-message.schema");
const chat_room_schema_1 = require("./schemas/chat-room.schema");
const elasticsearch_service_1 = require("../elasticsearch/elasticsearch.service");
let ChatService = ChatService_1 = class ChatService {
    constructor(chatMessageModel, chatRoomModel, elasticsearchService) {
        this.chatMessageModel = chatMessageModel;
        this.chatRoomModel = chatRoomModel;
        this.elasticsearchService = elasticsearchService;
        this.logger = new common_1.Logger(ChatService_1.name);
    }
    async createRoom(createChatRoomDto) {
        const newRoom = new this.chatRoomModel({
            ...createChatRoomDto,
            lastMessageAt: new Date(),
        });
        const savedRoom = await newRoom.save();
        this.logger.log(`Created new chat room: ${savedRoom.id}`);
        return savedRoom;
    }
    async getRoomById(id) {
        const room = await this.chatRoomModel.findById(id);
        if (!room) {
            throw new common_1.NotFoundException(`Chat room with ID ${id} not found`);
        }
        return room;
    }
    async getRoomsByUserId(userId) {
        return this.chatRoomModel
            .find({ participants: userId })
            .sort({ lastMessageAt: -1 })
            .exec();
    }
    async createMessage(createChatMessageDto) {
        const room = await this.chatRoomModel.findById(createChatMessageDto.roomId);
        if (!room) {
            throw new common_1.NotFoundException(`Chat room with ID ${createChatMessageDto.roomId} not found`);
        }
        const newMessage = new this.chatMessageModel(createChatMessageDto);
        const savedMessage = await newMessage.save();
        await this.chatRoomModel.findByIdAndUpdate(createChatMessageDto.roomId, { lastMessageAt: new Date() });
        try {
            await this.elasticsearchService.indexChatMessage({
                id: savedMessage.id,
                ...savedMessage.toObject(),
            });
            this.logger.log(`Indexed chat message in Elasticsearch: ${savedMessage.id}`);
        }
        catch (error) {
            this.logger.error(`Failed to index chat message in Elasticsearch: ${error.message}`, error.stack);
        }
        return savedMessage;
    }
    async getMessagesByRoomId(roomId, limit = 50, before) {
        const query = { roomId };
        if (before) {
            query.createdAt = { $lt: before };
        }
        return this.chatMessageModel
            .find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .exec();
    }
    async markMessagesAsRead(roomId, userId) {
        const result = await this.chatMessageModel.updateMany({ roomId, userId: { $ne: userId }, isRead: false }, { isRead: true });
        this.logger.log(`Marked ${result.modifiedCount} messages as read in room ${roomId}`);
        try {
            const messages = await this.chatMessageModel.find({
                roomId,
                userId: { $ne: userId },
                isRead: true,
                updatedAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) },
            });
            if (messages.length > 0) {
                await Promise.all(messages.map(message => this.elasticsearchService.updateChatMessage(message.id, { isRead: true })));
            }
        }
        catch (error) {
            this.logger.error(`Failed to update read status in Elasticsearch: ${error.message}`, error.stack);
        }
    }
    async searchMessages(params) {
        return this.elasticsearchService.searchChatHistory(params);
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = ChatService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(chat_message_schema_1.ChatMessage.name)),
    __param(1, (0, mongoose_1.InjectModel)(chat_room_schema_1.ChatRoom.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        elasticsearch_service_1.ElasticsearchService])
], ChatService);
//# sourceMappingURL=chat.service.js.map