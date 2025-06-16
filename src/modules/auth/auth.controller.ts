import { Controller, Get, Post, UseGuards, Request, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ClerkAuthGuard } from './guards/clerk-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(ClerkAuthGuard)
  @Post('sync-user')
  @ApiOperation({ summary: 'Sync authenticated Clerk user to local database' })
  @ApiResponse({ status: 200, description: 'User synced successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  async syncUser(@Request() req) {
    const localUser = await this.authService.syncUserFromClerk(req.user);
    return {
      message: 'User synced successfully',
      user: {
        id: localUser.id,
        email: localUser.email,
        firstName: localUser.firstName,
        lastName: localUser.lastName,
        role: localUser.role,
      },
    };
  }

  @UseGuards(ClerkAuthGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  async getProfile(@Request() req) {
    const localUser = await this.authService.getUserProfile(req.user.id);
    return {
      message: 'Profile retrieved successfully',
      user: {
        ...req.user, // Clerk user data
        localData: localUser, // Local database data
      },
      session: {
        id: req.session?.id,
        status: req.session?.status,
      },
    };
  }

  @UseGuards(ClerkAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin-only')
  @ApiOperation({ summary: 'Admin only endpoint' })
  @ApiResponse({ status: 200, description: 'Admin access granted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiBearerAuth()
  async adminOnly(@Request() req) {
    return {
      message: 'Admin access granted',
      user: req.user,
    };
  }
}