import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage, ChatMessageDocument } from './schemas/chat-message.schema';
import { ChatRoom, ChatRoomDocument } from './schemas/chat-room.schema';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectModel(ChatMessage.name) private chatMessageModel: Model<ChatMessageDocument>,
    @InjectModel(ChatRoom.name) private chatRoomModel: Model<ChatRoomDocument>,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  // Chat room operations
  async createRoom(createChatRoomDto: CreateChatRoomDto): Promise<ChatRoom> {
    const newRoom = new this.chatRoomModel({
      ...createChatRoomDto,
      lastMessageAt: new Date(),
    });
    
    const savedRoom = await newRoom.save();
    this.logger.log(`Created new chat room: ${savedRoom.id}`);
    
    return savedRoom;
  }

  async getRoomById(id: string): Promise<ChatRoom> {
    const room = await this.chatRoomModel.findById(id);
    if (!room) {
      throw new NotFoundException(`Chat room with ID ${id} not found`);
    }
    return room;
  }

  async getRoomsByUserId(userId: string): Promise<ChatRoom[]> {
    return this.chatRoomModel
      .find({ participants: userId })
      .sort({ lastMessageAt: -1 })
      .exec();
  }

  // Chat message operations
  async createMessage(createChatMessageDto: CreateChatMessageDto): Promise<ChatMessage> {
    // First check if the room exists
    const room = await this.chatRoomModel.findById(createChatMessageDto.roomId);
    if (!room) {
      throw new NotFoundException(`Chat room with ID ${createChatMessageDto.roomId} not found`);
    }

    // Create and save the message
    const newMessage = new this.chatMessageModel(createChatMessageDto);
    const savedMessage = await newMessage.save();
    
    // Update the room's lastMessageAt
    await this.chatRoomModel.findByIdAndUpdate(
      createChatMessageDto.roomId,
      { lastMessageAt: new Date() },
    );

    // Index the message in Elasticsearch
    try {
      await this.elasticsearchService.indexChatMessage({
        id: savedMessage.id,
        ...savedMessage.toObject(),
      });
      this.logger.log(`Indexed chat message in Elasticsearch: ${savedMessage.id}`);
    } catch (error) {
      this.logger.error(`Failed to index chat message in Elasticsearch: ${error.message}`, error.stack);
      // We don't want to fail the message creation if Elasticsearch indexing fails
    }

    return savedMessage;
  }

  async getMessagesByRoomId(roomId: string, limit = 50, before?: Date): Promise<ChatMessage[]> {
    const query: any = { roomId };
    
    if (before) {
      query.createdAt = { $lt: before };
    }
    
    return this.chatMessageModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async markMessagesAsRead(roomId: string, userId: string): Promise<void> {
    const result = await this.chatMessageModel.updateMany(
      { roomId, userId: { $ne: userId }, isRead: false },
      { isRead: true },
    );
    
    this.logger.log(`Marked ${result.modifiedCount} messages as read in room ${roomId}`);
    
    // Update Elasticsearch documents
    try {
      const messages = await this.chatMessageModel.find({
        roomId,
        userId: { $ne: userId },
        isRead: true,
        updatedAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }, // Only recently updated messages
      });
      
      if (messages.length > 0) {
        await Promise.all(
          messages.map(message => 
            this.elasticsearchService.updateChatMessage(message.id, { isRead: true })
          )
        );
      }
    } catch (error) {
      this.logger.error(`Failed to update read status in Elasticsearch: ${error.message}`, error.stack);
    }
  }

  // Search operations
  async searchMessages(params: {
    userId?: string;
    roomId?: string;
    content?: string;
    startDate?: Date;
    endDate?: Date;
    from?: number;
    size?: number;
  }): Promise<any> {
    return this.elasticsearchService.searchChatHistory(params);
  }
}