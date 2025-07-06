import { IsOptional, IsDateString, IsString, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSessionDto {
  @ApiPropertyOptional({
    description: 'Last activity timestamp',
    example: '2025-07-06T10:35:00Z'
  })
  @IsOptional()
  @IsDateString()
  lastActivity?: Date;

  @ApiPropertyOptional({
    description: 'Session end timestamp',
    example: '2025-07-06T11:00:00Z'
  })
  @IsOptional()
  @IsDateString()
  endedAt?: Date;

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
