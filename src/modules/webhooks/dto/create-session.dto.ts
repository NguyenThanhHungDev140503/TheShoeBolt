import { IsString, IsUUID, IsOptional, IsObject, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSessionDto {
  @ApiProperty({
    description: 'Clerk session ID',
    example: 'sess_2bxfCJOe0Ocd8DNe9hFN3H5Kp1A'
  })
  @IsString()
  clerkSessionId: string;

  @ApiProperty({
    description: 'User ID from our database',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  userId: string;

  @ApiPropertyOptional({
    description: 'Session creation timestamp',
    example: '2025-07-06T10:30:00Z'
  })
  @IsOptional()
  @IsDateString()
  createdAt?: Date;

  @ApiPropertyOptional({
    description: 'Last activity timestamp',
    example: '2025-07-06T10:35:00Z'
  })
  @IsOptional()
  @IsDateString()
  lastActivity?: Date;

  @ApiPropertyOptional({
    description: 'Client IP address',
    example: '192.168.1.100'
  })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiPropertyOptional({
    description: 'User agent string',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiPropertyOptional({
    description: 'Additional session metadata',
    example: { device: 'desktop', browser: 'chrome' }
  })
  @IsOptional()
  @IsObject()
  sessionMetadata?: Record<string, any>;
}
