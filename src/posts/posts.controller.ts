import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFiles,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  MediaFilesValidationPipe,
  uploadMediaConfig,
} from 'src/storage/config/upload/media';
import { JwtAuthGuard } from 'src/auth/guards';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 5, uploadMediaConfig))
  create(
    @Request() req: any,
    @UploadedFiles(MediaFilesValidationPipe) files: Express.Multer.File[],
    @Body() createPostDto: CreatePostDto,
  ) {
    return this.postsService.create(req.user.id, files, createPostDto.caption);
  }
}
