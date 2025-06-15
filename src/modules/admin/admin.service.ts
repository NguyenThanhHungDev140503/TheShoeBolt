import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';
import { ChatService } from '../chat/chat.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatMessage } from '../chat/schemas/chat-message.schema';
import { ChatRoom } from '../chat/schemas/chat-room.schema';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly chatService: ChatService,
    @InjectModel(ChatMessage.name) private chatMessageModel: Model<ChatMessage>,
    @InjectModel(ChatRoom.name) private chatRoomModel: Model<ChatRoom>,
  ) {}

  async searchChatMessages(params: {
    userId?: string;
    roomId?: string;
    content?: string;
    startDate?: Date;
    endDate?: Date;
    from?: number;
    size?: number;
  }) {
    // Admin can search all messages without user restrictions
    return this.elasticsearchService.searchChatHistory(params);
  }

  async searchUsers(query: string, options: any = {}) {
    return this.elasticsearchService.searchUsers(query, options);
  }

  async getChatStats(startDate?: Date, endDate?: Date) {
    const dateQuery: any = {};
    
    if (startDate || endDate) {
      dateQuery.createdAt = {};
      if (startDate) {
        dateQuery.createdAt.$gte = startDate;
      }
      if (endDate) {
        dateQuery.createdAt.$lte = endDate;
      }
    }

    const [
      totalMessages,
      totalRooms,
      activeRooms,
      messagesWithAttachments,
    ] = await Promise.all([
      // Total messages
      this.chatMessageModel.countDocuments(dateQuery),
      
      // Total rooms
      this.chatRoomModel.countDocuments(dateQuery),
      
      // Active rooms (with messages in the date range)
      this.chatMessageModel.distinct('roomId', dateQuery).then(rooms => rooms.length),
      
      // Messages with attachments
      this.chatMessageModel.countDocuments({
        ...dateQuery,
        'attachments.0': { $exists: true },
      }),
    ]);

    // Get message count by day for the chart
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
}