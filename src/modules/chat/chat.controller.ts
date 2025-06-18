import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  Request,
  NotFoundException,
  Logger
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ClerkAuthGuard } from '../clerk/guards/clerk-auth.guard';
import { ChatService } from './chat.service';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';

@ApiTags('Chat')
@Controller('chat')
@UseGuards(ClerkAuthGuard)
@ApiBearerAuth()
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(private readonly chatService: ChatService) {}

  @Post('rooms')
  @ApiOperation({ summary: 'Create a new chat room' })
  @ApiResponse({ status: 201, description: 'The chat room has been created' })
  async createRoom(@Body() createChatRoomDto: CreateChatRoomDto, @Request() req) {
    this.logger.log(`Creating chat room by user ${req.user.id}`);
    return this.chatService.createRoom({
      ...createChatRoomDto,
      createdBy: req.user.id,
    });
  }

  @Get('rooms')
  @ApiOperation({ summary: 'Get all chat rooms for the current user' })
  @ApiResponse({ status: 200, description: 'Returns all chat rooms' })
  async getUserRooms(@Request() req) {
    return this.chatService.getRoomsByUserId(req.user.id);
  }

  @Get('rooms/:id')
  @ApiOperation({ summary: 'Get a chat room by ID' })
  @ApiResponse({ status: 200, description: 'Returns the chat room' })
  @ApiResponse({ status: 404, description: 'Chat room not found' })
  async getRoomById(@Param('id') id: string) {
    return this.chatService.getRoomById(id);
  }

  @Post('messages')
  @ApiOperation({ summary: 'Create a new chat message' })
  @ApiResponse({ status: 201, description: 'The chat message has been created' })
  async createMessage(@Body() createChatMessageDto: CreateChatMessageDto, @Request() req) {
    this.logger.log(`Creating chat message by user ${req.user.id} in room ${createChatMessageDto.roomId}`);
    return this.chatService.createMessage({
      ...createChatMessageDto,
      userId: req.user.id,
    });
  }

  @Get('rooms/:roomId/messages')
  @ApiOperation({ summary: 'Get messages for a chat room' })
  @ApiResponse({ status: 200, description: 'Returns chat messages' })
  async getRoomMessages(
    @Param('roomId') roomId: string,
    @Query('limit') limit: number = 50,
    @Query('before') before?: string,
  ) {
    // Check if the room exists
    await this.chatService.getRoomById(roomId);
    
    const beforeDate = before ? new Date(before) : undefined;
    return this.chatService.getMessagesByRoomId(roomId, limit, beforeDate);
  }

  @Post('rooms/:roomId/read')
  @ApiOperation({ summary: 'Mark all messages in a room as read' })
  @ApiResponse({ status: 200, description: 'Messages marked as read' })
  async markMessagesAsRead(@Param('roomId') roomId: string, @Request() req) {
    await this.chatService.markMessagesAsRead(roomId, req.user.id);
    return { success: true };
  }

  @Post('search')
  @ApiOperation({ summary: 'Search chat messages' })
  @ApiResponse({ status: 200, description: 'Returns search results' })
  async searchMessages(
    @Body() searchParams: {
      roomId?: string;
      content?: string;
      startDate?: Date;
      endDate?: Date;
      from?: number;
      size?: number;
    },
    @Request() req,
  ) {
    return this.chatService.searchMessages({
      userId: req.user.id,
      ...searchParams,
    });
  }
}