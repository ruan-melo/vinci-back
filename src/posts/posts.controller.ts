import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Request,
  Query,
  ParseBoolPipe,
  ConflictException,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ParseJsonPipe } from 'src/pipes/parse-json.pipe';
import {
  MediaFilesValidationPipe,
  uploadMediaConfig,
} from 'src/storage/config/upload/media';
import { User } from 'src/decorators/user.decorator';
import {
  Post as PrismaPost,
  PostMedia,
  User as PrismaUser,
} from '@prisma/client';
import { UserJwt } from 'src/auth/strategies/jwt.strategy';
import { mediaMapper } from './mappers/mediaMapper';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files', 5, uploadMediaConfig))
  create(
    @Request() req: any,
    @UploadedFiles(MediaFilesValidationPipe) files: Express.Multer.File[],
    @Body() createPostDto: CreatePostDto,
  ) {
    return this.postsService.create(req.user.id, files, createPostDto.caption);
  }

  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @Get('/timeline')
  async getTimeline(@User() user: UserJwt) {
    const timeline = await this.postsService.getTimeline(user.id);
    return timeline.map((post) => {
      return {
        ...post,
        medias: post.medias.map((media) => mediaMapper(media)),
      };
    });
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    // @Query('posts', ParseBoolPipe) posts: boolean,
  ) {
    return this.postsService.findOne(id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
  //   return this.postsService.update(+id, updatePostDto);
  // }

  @Delete(':id')
  async delete(@Param('id') id: string, @User() user: PrismaUser) {
    const post = await this.postsService.findOne(id);

    if (post.authorId !== user.id) {
      throw new ConflictException('You are not authorized to delete this post');
    }
    return this.postsService.delete(id);
  }
}
