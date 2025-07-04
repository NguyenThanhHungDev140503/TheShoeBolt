import {
  Controller,
  Get,
  Delete,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ClerkSessionService } from './clerk.session.service';
import { ClerkAuthGuard } from './guards/clerk-auth.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { UserRole } from '../../users/entities/user.entity';
import { SessionIdParamDto, UserIdParamDto } from './dto/clerk-params.dto';

@ApiTags('Clerk Session Management')
@Controller('clerk')
@UseGuards(ClerkAuthGuard)
export class ClerkController {
  constructor(private readonly clerkSessionService: ClerkSessionService) {}

  @Get('sessions')
  @ApiOperation({ summary: 'Get all sessions for current user' })
  @ApiResponse({ status: 200, description: 'Sessions retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserSessions(@Request() req) {
    const sessions = await this.clerkSessionService.getSessionList(req.clerkUser.userId);
    return {
      message: 'Sessions retrieved successfully',
      sessions,
    };
  }

  @Delete('sessions/:sessionId')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute for sensitive operations
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke a specific session' })
  @ApiParam({ name: 'sessionId', description: 'Session ID to revoke' })
  @ApiResponse({ status: 200, description: 'Session revoked successfully' })
  @ApiResponse({ status: 400, description: 'Invalid session ID format' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @ApiResponse({ status: 429, description: 'Too Many Requests' })
  async revokeSession(@Param() params: SessionIdParamDto) {
    const revokedSession = await this.clerkSessionService.revokeSession(params.sessionId);
    return {
        message: `Session ${params.sessionId} revoked successfully`,
        session: revokedSession,
    };
  }

  @Delete('sessions')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 requests per minute for revoke all
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke all sessions for current user' })
  @ApiResponse({ status: 200, description: 'All sessions revoked successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 429, description: 'Too Many Requests' })
  async revokeAllSessions(@Request() req) {
    const revokedInfo = await this.clerkSessionService.revokeAllUserSessions(req.clerkUser.userId);
    return {
        message: 'All sessions revoked successfully',
        details: revokedInfo,
    };
  }

  @UseGuards(ClerkAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/users/:userId/sessions')
  @ApiOperation({ summary: 'Admin: Get sessions for any user' })
  @ApiParam({ name: 'userId', description: 'User ID to get sessions for' })
  @ApiResponse({ status: 200, description: 'User sessions retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid user ID format' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getAnyUserSessions(@Param() params: UserIdParamDto) {
    const sessions = await this.clerkSessionService.getSessionList(params.userId);
    return {
      message: 'User sessions retrieved successfully',
      userId: params.userId,
      sessions,
    };
  }

  @UseGuards(ClerkAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute for admin operations
  @Delete('admin/users/:userId/sessions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin: Revoke all sessions for any user' })
  @ApiParam({ name: 'userId', description: 'User ID to revoke sessions for' })
  @ApiResponse({ status: 200, description: 'All user sessions revoked successfully' })
  @ApiResponse({ status: 400, description: 'Invalid user ID format' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 429, description: 'Too Many Requests' })
  async revokeAllUserSessions(@Param() params: UserIdParamDto) {
    const revokedInfo = await this.clerkSessionService.revokeAllUserSessions(params.userId);
    return {
        message: `All sessions for user ${params.userId} revoked successfully`,
        details: revokedInfo,
    };
  }
}