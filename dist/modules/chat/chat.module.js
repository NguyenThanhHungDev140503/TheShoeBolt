"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const chat_service_1 = require("./chat.service");
const chat_controller_1 = require("./chat.controller");
const chat_gateway_1 = require("./chat.gateway");
const chat_message_schema_1 = require("./schemas/chat-message.schema");
const chat_room_schema_1 = require("./schemas/chat-room.schema");
const elasticsearch_module_1 = require("../elasticsearch/elasticsearch.module");
const users_module_1 = require("../users/users.module");
let ChatModule = class ChatModule {
};
exports.ChatModule = ChatModule;
exports.ChatModule = ChatModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            mongoose_1.MongooseModule.forFeature([
                { name: chat_message_schema_1.ChatMessage.name, schema: chat_message_schema_1.ChatMessageSchema },
                { name: chat_room_schema_1.ChatRoom.name, schema: chat_room_schema_1.ChatRoomSchema },
            ]),
            elasticsearch_module_1.ElasticsearchModule,
            users_module_1.UsersModule,
        ],
        controllers: [chat_controller_1.ChatController],
        providers: [chat_service_1.ChatService, chat_gateway_1.ChatGateway],
        exports: [chat_service_1.ChatService],
    })
], ChatModule);
//# sourceMappingURL=chat.module.js.map