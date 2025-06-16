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
var AdminService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const elasticsearch_service_1 = require("../elasticsearch/elasticsearch.service");
const chat_service_1 = require("../chat/chat.service");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const chat_message_schema_1 = require("../chat/schemas/chat-message.schema");
const chat_room_schema_1 = require("../chat/schemas/chat-room.schema");
let AdminService = AdminService_1 = class AdminService {
    constructor(elasticsearchService, chatService, chatMessageModel, chatRoomModel) {
        this.elasticsearchService = elasticsearchService;
        this.chatService = chatService;
        this.chatMessageModel = chatMessageModel;
        this.chatRoomModel = chatRoomModel;
        this.logger = new common_1.Logger(AdminService_1.name);
    }
    async searchChatMessages(params) {
        return this.elasticsearchService.searchChatHistory(params);
    }
    async searchUsers(query, options = {}) {
        return this.elasticsearchService.searchUsers(query, options);
    }
    async getChatStats(startDate, endDate) {
        const dateQuery = {};
        if (startDate || endDate) {
            dateQuery.createdAt = {};
            if (startDate) {
                dateQuery.createdAt.$gte = startDate;
            }
            if (endDate) {
                dateQuery.createdAt.$lte = endDate;
            }
        }
        const [totalMessages, totalRooms, activeRooms, messagesWithAttachments,] = await Promise.all([
            this.chatMessageModel.countDocuments(dateQuery),
            this.chatRoomModel.countDocuments(dateQuery),
            this.chatMessageModel.distinct('roomId', dateQuery).then(rooms => rooms.length),
            this.chatMessageModel.countDocuments({
                ...dateQuery,
                'attachments.0': { $exists: true },
            }),
        ]);
        let messagesByDay = [];
        if (startDate && endDate) {
            const pipeline = [
                {
                    $match: {
                        createdAt: { $gte: startDate, $lte: endDate },
                    },
                },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        count: { $sum: 1 },
                    },
                },
                {
                    $sort: { _id: 1 },
                },
            ];
            messagesByDay = await this.chatMessageModel.aggregate(pipeline);
        }
        return {
            totalMessages,
            totalRooms,
            activeRooms,
            messagesWithAttachments,
            messagesByDay: messagesByDay.map(item => ({
                date: item._id,
                count: item.count,
            })),
        };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = AdminService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, mongoose_1.InjectModel)(chat_message_schema_1.ChatMessage.name)),
    __param(3, (0, mongoose_1.InjectModel)(chat_room_schema_1.ChatRoom.name)),
    __metadata("design:paramtypes", [elasticsearch_service_1.ElasticsearchService,
        chat_service_1.ChatService,
        mongoose_2.Model,
        mongoose_2.Model])
], AdminService);
//# sourceMappingURL=admin.service.js.map