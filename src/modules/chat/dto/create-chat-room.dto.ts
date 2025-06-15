import { IsString, IsNotEmpty, IsArray, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChatRoomDto {
  @ApiProperty({ example: 'Support Team' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'group', enum: ['direct', 'group'], default: 'group' })
  @IsString()
  @IsOptional()
  @IsIn(['direct', 'group'])
  type?: string = 'group';

  @ApiProperty({ example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439013'] })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  participants: string[];

  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsString()
  @IsNotEmpty()
  createdBy: string;
}