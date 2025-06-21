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
var ChatGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const chat_service_1 = require("./chat.service");
const create_chat_message_dto_1 = require("./dto/create-chat-message.dto");
const clerk_sdk_node_1 = require("@clerk/clerk-sdk-node");
let ChatGateway = ChatGateway_1 = class ChatGateway {
    constructor(chatService, options) {
        this.chatService = chatService;
        this.options = options;
        this.logger = new common_1.Logger(ChatGateway_1.name);
        this.connectedUsers = new Map();
    }
    afterInit(server) {
        this.logger.log('WebSocket Gateway initialized');
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
            if (!token) {
                this.logger.error('No token provided, disconnecting client');
                client.disconnect();
                return;
            }
            try {
                const sessionToken = await clerk_sdk_node_1.clerkClient.verifyToken(token, {
                    secretKey: this.options.secretKey,
                    issuer: `https://clerk.${this.options.publishableKey.split('_')[1]}.lcl.dev`,
                });
                const session = await clerk_sdk_node_1.clerkClient.sessions.getSession(sessionToken.sid);
                if (!session || session.status !== 'active') {
                    throw new Error('Invalid or inactive session');
                }
                const user = await clerk_sdk_node_1.clerkClient.users.getUser(session.userId);
                const userId = user.id;
                this.connectedUsers.set(userId, client.id);
                client.data.userId = userId;
                client.data.clerkUser = user;
                client.data.session = session;
                const rooms = await this.chatService.getRoomsByUserId(userId);
                rooms.forEach(room => {
                    client.join(room.id);
                });
                this.logger.log(`Client connected: ${client.id}, User: ${userId}`);
                this.server.emit('userStatus', { userId, status: 'online' });
                const onlineUsers = Array.from(this.connectedUsers.keys());
                client.emit('onlineUsers', onlineUsers);
            }
            catch (error) {
                this.logger.error(`Token verification failed: ${error.message}`);
                client.disconnect();
            }
        }
        catch (error) {
            this.logger.error(`Connection error: ${error.message}`);
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        const userId = client.data.userId;
        if (userId) {
            this.connectedUsers.delete(userId);
            this.logger.log(`Client disconnected: ${client.id}, User: ${userId}`);
            this.server.emit('userStatus', { userId, status: 'offline' });
        }
    }
    handleJoinRoom(client, roomId) {
        client.join(roomId);
        this.logger.log(`User ${client.data.userId} joined room ${roomId}`);
        return { event: 'joinedRoom', data: roomId };
    }
    handleLeaveRoom(client, roomId) {
        client.leave(roomId);
        this.logger.log(`User ${client.data.userId} left room ${roomId}`);
        return { event: 'leftRoom', data: roomId };
    }
    async handleSendMessage(client, createMessageDto) {
        try {
            createMessageDto.userId = client.data.userId;
            const savedMessage = await this.chatService.createMessage(createMessageDto);
            this.server.to(createMessageDto.roomId).emit('newMessage', savedMessage);
            this.logger.log(`Message sent to room ${createMessageDto.roomId} by user ${client.data.userId}`);
            return { event: 'messageSent', data: savedMessage };
        }
        catch (error) {
            this.logger.error(`Error sending message: ${error.message}`, error.stack);
            return { event: 'messageError', data: { error: error.message } };
        }
    }
    handleTyping(client, data) {
        client.to(data.roomId).emit('userTyping', {
            userId: client.data.userId,
            roomId: data.roomId,
            isTyping: data.isTyping,
        });
    }
    async handleMarkAsRead(client, roomId) {
        try {
            await this.chatService.markMessagesAsRead(roomId, client.data.userId);
            client.to(roomId).emit('messagesRead', {
                userId: client.data.userId,
                roomId,
                timestamp: new Date(),
            });
        }
        catch (error) {
            this.logger.error(`Error marking messages as read: ${error.message}`, error.stack);
        }
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinRoom'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", Object)
], ChatGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leaveRoom'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", Object)
], ChatGateway.prototype, "handleLeaveRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('sendMessage'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket,
        create_chat_message_dto_1.CreateChatMessageDto]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleSendMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleTyping", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('markAsRead'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleMarkAsRead", null);
exports.ChatGateway = ChatGateway = ChatGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
            credentials: true,
        },
    }),
    __param(1, (0, common_1.Inject)('CLERK_OPTIONS')),
    __metadata("design:paramtypes", [chat_service_1.ChatService, Object])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map