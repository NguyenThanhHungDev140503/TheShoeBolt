import {
  Controller,
  Get,
  Delete,
  Post,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ClerkSessionService } from './clerk.session.service';
import { ClerkAuthGuard } from './guards/clerk-auth.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { UserRole } from '../../users/entities/user.entity';

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
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke a specific session' })
  @ApiParam({ name: 'sessionId', description: 'Session ID to revoke' })
  @ApiResponse({ status: 200, description: 'Session revoked successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async revokeSession(@Param('sessionId') sessionId: string) {
    const revokedSession = await this.clerkSessionService.revokeSession(sessionId);
    return {
        message: `Session ${sessionId} revoked successfully`,
        session: revokedSession,
    };
  }

  @Delete('sessions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke all sessions for current user' })
  @ApiResponse({ status: 200, description: 'All sessions revoked successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  async getAnyUserSessions(@Param('userId') userId: string) {
    const sessions = await this.clerkSessionService.getSessionList(userId);
    return {
      message: 'User sessions retrieved successfully',
      userId,
      sessions,
    };
  }

  @UseGuards(ClerkAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('admin/users/:userId/sessions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin: Revoke all sessions for any user' })
  @ApiParam({ name: 'userId', description: 'User ID to revoke sessions for' })
  async revokeAllUserSessions(@Param('userId') userId: string) {
    const revokedInfo = await this.clerkSessionService.revokeAllUserSessions(userId);
    return {
        message: `All sessions for user ${userId} revoked successfully`,
        details: revokedInfo,
    };
  }
}