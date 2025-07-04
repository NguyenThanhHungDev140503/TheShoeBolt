import { IsString, Matches, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for validating Clerk session ID parameters
 */
export class SessionIdParamDto {
  @ApiProperty({
    description: 'Clerk session ID',
    example: 'sess_2b6fcd92dvf96q05x8e4a8xvt6a',
    pattern: '^sess_[a-zA-Z0-9]+$'
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^sess_[a-zA-Z0-9]+$/, { 
    message: 'Invalid session ID format. Session ID must start with "sess_" followed by alphanumeric characters.' 
  })
  sessionId: string;
}

/**
 * DTO for validating Clerk user ID parameters
 */
export class UserIdParamDto {
  @ApiProperty({
    description: 'Clerk user ID',
    example: 'user_2b6fcd92dvf96q05x8e4a8xvt6a',
    pattern: '^user_[a-zA-Z0-9]+$'
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^user_[a-zA-Z0-9]+$/, { 
    message: 'Invalid user ID format. User ID must start with "user_" followed by alphanumeric characters.' 
  })
  userId: string;
}
