import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Request,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileUploadService } from './file-upload.service';
import { FileType } from './entities/file.entity';

@ApiTags('File Upload')
@Controller('files')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a single file' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
    @Query('width', { transform: (val) => val ? parseInt(val) : undefined }) width?: number,
    @Query('height', { transform: (val) => val ? parseInt(val) : undefined }) height?: number,
    @Query('quality', { transform: (val) => val ? parseInt(val) : undefined }) quality?: number,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const options: any = {};
    
    if (width && height) {
      options.resize = { width, height };
    }
    
    if (quality) {
      options.quality = quality;
    }

    return this.fileUploadService.uploadFile(file, req.user.id, options);
  }

  @Post('upload/multiple')
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiOperation({ summary: 'Upload multiple files' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Files uploaded successfully' })
  async uploadMultipleFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    return this.fileUploadService.uploadMultipleFiles(files, req.user.id);
  }

  @Get('my-files')
  @ApiOperation({ summary: 'Get user files' })
  @ApiResponse({ status: 200, description: 'Returns user files' })
  async getUserFiles(
    @Request() req,
    @Query('type') type?: FileType,
  ) {
    return this.fileUploadService.getUserFiles(req.user.id, type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file by ID' })
  @ApiResponse({ status: 200, description: 'Returns file information' })
  async getFile(@Param('id') id: string) {
    return this.fileUploadService.getFile(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete file' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  async deleteFile(@Param('id') id: string) {
    await this.fileUploadService.deleteFile(id);
    return { success: true };
  }
}