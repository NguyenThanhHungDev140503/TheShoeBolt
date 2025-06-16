import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EmailsService } from './emails.service';
import { SendEmailDto } from './dto/send-email.dto';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';

@ApiTags('Emails')
@Controller('emails')
@UseGuards(ClerkAuthGuard)
@ApiBearerAuth()
export class EmailsController {
  constructor(private readonly emailsService: EmailsService) {}

  @Post('send')
  @ApiOperation({ summary: 'Send email' })
  @ApiResponse({ status: 201, description: 'Email sent successfully' })
  sendEmail(@Body() sendEmailDto: SendEmailDto) {
    return this.emailsService.sendEmail(sendEmailDto);
  }
}