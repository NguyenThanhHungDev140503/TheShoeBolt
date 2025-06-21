import { applyDecorators, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../guards/admin.guard';
import { ApiResponse, ApiUnauthorizedResponse, ApiForbiddenResponse } from '@nestjs/swagger';

/**
 * Decorator kết hợp để bảo vệ routes chỉ dành cho Admin
 * - Áp dụng AdminGuard
 * - Tự động thêm các responses API docs
 */
export function AdminOnly() {
  return applyDecorators(
    UseGuards(AdminGuard),
    ApiResponse({ status: 200, description: 'Successful operation (Admin only)' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiForbiddenResponse({ description: 'Forbidden - Admin role required' })
  );
} 