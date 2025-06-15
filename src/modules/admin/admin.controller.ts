import { Controller, Get, Post, Body, Query, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth()
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

  constructor(private readonly adminService: AdminService) {}

  @Post('chat/search')
  @ApiOperation({ summary: 'Search chat messages (admin)' })
  @ApiResponse({ status: 200, description: 'Returns search results' })
  async searchChatMessages(
    @Body() searchParams: {
      userId?: string;
      roomId?: string;
      content?: string;
      startDate?: Date;
      endDate?: Date;
      from?: number;
      size?: number;
    },
  ) {
    this.logger.log(`Admin searching chat messages with params: ${JSON.stringify(searchParams)}`);
    return this.adminService.searchChatMessages(searchParams);
  }

  @Get('chat/stats')
  @ApiOperation({ summary: 'Get chat statistics' })
  @ApiResponse({ status: 200, description: 'Returns chat statistics' })
  async getChatStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    
    return this.adminService.getChatStats(start, end);
  }

  @Get('users/search')
  @ApiOperation({ summary: 'Search users (admin)' })
  @ApiResponse({ status: 200, description: 'Returns user search results' })
  async searchUsers(
    @Query('query') query: string,
    @Query('from') from: number = 0,
    @Query('size') size: number = 10,
  ) {
    this.logger.log(`Admin searching users with query: ${query}`);
    return this.adminService.searchUsers(query, { from, size });
  }
}