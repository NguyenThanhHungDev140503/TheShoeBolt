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
    const sessions = await this.clerkSessionService.getSessionList(req.user.id);
    return {
      message: 'Sessions retrieved successfully',
      sessions,
    };
  }

  @Delete('sessions/:sessionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke a specific session' })
  @ApiParam({ name: 'sessionId', description: 'Session ID to revoke' })
  @ApiResponse({ status: 204, description: 'Session revoked successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async revokeSession(@Param('sessionId') sessionId: string) {
    await this.clerkSessionService.revokeSession(sessionId);
    return;
  }

  @Delete('sessions')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke all sessions for current user' })
  @ApiResponse({ status: 204, description: 'All sessions revoked successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async revokeAllSessions(@Request() req) {
    await this.clerkSessionService.revokeAllUserSessions(req.user.id);
    return;
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
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Admin: Revoke all sessions for any user' })
  @ApiParam({ name: 'userId', description: 'User ID to revoke sessions for' })
  async revokeAllUserSessions(@Param('userId') userId: string) {
    await this.clerkSessionService.revokeAllUserSessions(userId);
    return;
  }
}