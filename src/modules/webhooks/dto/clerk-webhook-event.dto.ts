import { IsString, IsNumber, IsOptional, IsObject, IsArray, ValidateNested, IsEmail, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EmailAddressDto {
  @ApiProperty({ description: 'Email address ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Email address value' })
  @IsEmail()
  email_address: string;

  @ApiProperty({ description: 'Whether this is the primary email' })
  @IsOptional()
  primary?: boolean;

  @ApiProperty({ description: 'Verification status' })
  @IsOptional()
  @IsObject()
  verification?: Record<string, any>;
}

export class LastActiveDto {
  @ApiProperty({ description: 'Timestamp of last activity' })
  @IsNumber()
  timestamp: number;

  @ApiPropertyOptional({ description: 'IP address of last activity' })
  @IsOptional()
  @IsString()
  ip_address?: string;

  @ApiPropertyOptional({ description: 'User agent of last activity' })
  @IsOptional()
  @IsString()
  user_agent?: string;

  @ApiPropertyOptional({ description: 'City of last activity' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Country of last activity' })
  @IsOptional()
  @IsString()
  country?: string;
}

export class ClerkUserEventDto {
  @ApiProperty({ description: 'Clerk user ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'User email addresses', type: [EmailAddressDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmailAddressDto)
  email_addresses: EmailAddressDto[];

  @ApiPropertyOptional({ description: 'User first name' })
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiPropertyOptional({ description: 'User last name' })
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiPropertyOptional({ description: 'Profile image URL' })
  @IsOptional()
  @IsUrl()
  profile_image_url?: string;

  @ApiPropertyOptional({ description: 'Public metadata' })
  @IsOptional()
  @IsObject()
  public_metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Private metadata' })
  @IsOptional()
  @IsObject()
  private_metadata?: Record<string, any>;

  @ApiProperty({ description: 'User creation timestamp' })
  @IsNumber()
  created_at: number;

  @ApiProperty({ description: 'User last update timestamp' })
  @IsNumber()
  updated_at: number;

  @ApiPropertyOptional({ description: 'User username' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ description: 'User phone numbers' })
  @IsOptional()
  @IsArray()
  phone_numbers?: any[];

  @ApiPropertyOptional({ description: 'External accounts' })
  @IsOptional()
  @IsArray()
  external_accounts?: any[];

  @ApiPropertyOptional({ description: 'Last sign in timestamp' })
  @IsOptional()
  @IsNumber()
  last_sign_in_at?: number;

  @ApiPropertyOptional({ description: 'Whether user is banned' })
  @IsOptional()
  banned?: boolean;

  @ApiPropertyOptional({ description: 'Whether user is locked' })
  @IsOptional()
  locked?: boolean;
}

export class ClerkSessionEventDto {
  @ApiProperty({ description: 'Clerk session ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'User ID associated with session' })
  @IsString()
  user_id: string;

  @ApiProperty({ description: 'Session creation timestamp' })
  @IsNumber()
  created_at: number;

  @ApiProperty({ description: 'Session last update timestamp' })
  @IsNumber()
  updated_at: number;

  @ApiPropertyOptional({ description: 'Last active information', type: LastActiveDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => LastActiveDto)
  last_active_at?: LastActiveDto;

  @ApiPropertyOptional({ description: 'Session status' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Session expiration timestamp' })
  @IsOptional()
  @IsNumber()
  expire_at?: number;

  @ApiPropertyOptional({ description: 'Session abandonment timestamp' })
  @IsOptional()
  @IsNumber()
  abandon_at?: number;
}

export class ClerkOrganizationEventDto {
  @ApiProperty({ description: 'Clerk organization ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Organization name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Organization slug' })
  @IsString()
  slug: string;

  @ApiProperty({ description: 'Organization creation timestamp' })
  @IsNumber()
  created_at: number;

  @ApiProperty({ description: 'Organization last update timestamp' })
  @IsNumber()
  updated_at: number;

  @ApiPropertyOptional({ description: 'Public metadata' })
  @IsOptional()
  @IsObject()
  public_metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Private metadata' })
  @IsOptional()
  @IsObject()
  private_metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Organization logo URL' })
  @IsOptional()
  @IsUrl()
  logo_url?: string;

  @ApiPropertyOptional({ description: 'Maximum allowed members' })
  @IsOptional()
  @IsNumber()
  max_allowed_memberships?: number;

  @ApiPropertyOptional({ description: 'Admin delete enabled' })
  @IsOptional()
  admin_delete_enabled?: boolean;
}

export class ClerkOrganizationMembershipEventDto {
  @ApiProperty({ description: 'Membership ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Organization information' })
  @IsObject()
  organization: {
    id: string;
    name: string;
    slug: string;
  };

  @ApiProperty({ description: 'Public user data' })
  @IsObject()
  public_user_data: {
    user_id: string;
    first_name?: string;
    last_name?: string;
    profile_image_url?: string;
    identifier?: string;
  };

  @ApiProperty({ description: 'Member role' })
  @IsString()
  role: string;

  @ApiProperty({ description: 'Membership creation timestamp' })
  @IsNumber()
  created_at: number;

  @ApiProperty({ description: 'Membership last update timestamp' })
  @IsNumber()
  updated_at: number;

  @ApiPropertyOptional({ description: 'Public metadata' })
  @IsOptional()
  @IsObject()
  public_metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Private metadata' })
  @IsOptional()
  @IsObject()
  private_metadata?: Record<string, any>;
}

export class WebhookEventDto {
  @ApiProperty({ description: 'Event type' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Event data - varies by event type' })
  @IsObject()
  data: ClerkUserEventDto | ClerkSessionEventDto | ClerkOrganizationEventDto | ClerkOrganizationMembershipEventDto;

  @ApiProperty({ description: 'Event object type' })
  @IsString()
  object: string;

  @ApiPropertyOptional({ description: 'Event timestamp' })
  @IsOptional()
  @IsNumber()
  timestamp?: number;
}
