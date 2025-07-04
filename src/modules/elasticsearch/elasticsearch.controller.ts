import { Controller, Get, Post, Body, Query, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ElasticsearchService } from './elasticsearch.service';
import { ClerkAuthGuard } from '../Infrastructure/clerk/guards/clerk-auth.guard';

@ApiTags('Elasticsearch')
@Controller('elasticsearch')
@UseGuards(ClerkAuthGuard)
@ApiBearerAuth()
export class ElasticsearchController {
  private readonly logger = new Logger(ElasticsearchController.name);

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  @Get('health')
  @ApiOperation({ summary: 'Check Elasticsearch health' })
  @ApiResponse({ status: 200, description: 'Returns Elasticsearch cluster health' })
  async checkHealth() {
    return this.elasticsearchService.checkHealth();
  }

  @Post('search/chat')
  @ApiOperation({ summary: 'Search chat messages' })
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
    this.logger.log(`Searching chat messages with params: ${JSON.stringify(searchParams)}`);
    return this.elasticsearchService.searchChatHistory(searchParams);
  }

  @Get('search/users')
  @ApiOperation({ summary: 'Search users' })
  @ApiResponse({ status: 200, description: 'Returns user search results' })
  async searchUsers(
    @Query('query') query: string,
    @Query('from') from: number = 0,
    @Query('size') size: number = 10,
  ) {
    this.logger.log(`Searching users with query: ${query}`);
    return this.elasticsearchService.searchUsers(query, { from, size });
  }
}