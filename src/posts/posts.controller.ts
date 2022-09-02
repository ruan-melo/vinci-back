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
  DefaultValuePipe,
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
  Prisma,
  Reaction,
  User as PrismaUser,
} from '@prisma/client';
import { UserJwt } from 'src/auth/strategies/jwt.strategy';
import { mediaMapper } from './mappers/mediaMapper';
import { Public } from 'src/auth/guards';

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

  @Post(':id/comments')
  async createComment(
    @Param('id') id: string,
    @Body('text') text: string,
    @User() user: PrismaUser,
  ) {
    console.log('comments create', text);
    return this.postsService.createComment({
      authorId: user.id,
      postId: id,
      text,
    });
  }

  @Get(':id/comments')
  async getComments(@Param('id') id: string) {
    return this.postsService.getComments(id);
  }

  @Delete(':id/comments/:commentId')
  async deleteComment(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @User() user: PrismaUser,
  ) {
    return this.postsService.deleteComment({
      commentId: commentId,
      userId: user.id,
    });
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

  @Public()
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Query('medias', new DefaultValuePipe(false), ParseBoolPipe)
    medias: boolean,
    @Query('comments', new DefaultValuePipe(false), ParseBoolPipe)
    comments: boolean,
    @Query('likes', new DefaultValuePipe(false), ParseBoolPipe) likes: boolean,
    @Query('liked', new DefaultValuePipe(false), ParseBoolPipe) liked: boolean,
    @Query('author', new DefaultValuePipe(false), ParseBoolPipe)
    author: boolean,
    @User() user: UserJwt,
  ) {
    const include: Prisma.PostInclude = {};

    if (medias) {
      include.medias = true;
    }

    if (comments) {
      include.comments = { include: { author: true } };
    }

    if (author) {
      include.author = true;
    }

    if (likes && user) {
      include.likes = { where: { userId: user.id } };
    }

    const post = (await this.postsService.findOne(
      id,
      include,
    )) as PrismaPost & { likes?: Reaction[] };
    return { post, liked: post.likes ? post.likes.length > 0 : false };
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
  //   return this.postsService.update(+id, updatePostDto);
  // }

  @Delete(':id')
  async delete(@Param('id') id: string, @User() user: UserJwt) {
    const post = await this.postsService.findOne(id);

    if (post.authorId !== user.id) {
      throw new ConflictException('You are not authorized to delete this post');
    }
    return this.postsService.delete({ postId: id, userId: user.id });
  }

  @Get(':id/likes')
  async getLikes(@Param('id') id: string) {
    return this.postsService.getLikes(id);
  }

  @Post(':id/likes')
  async likePost(@Param('id') id: string, @User() user: UserJwt) {
    return this.postsService.likePost({ postId: id, userId: user.id });
  }

  @Delete(':id/likes')
  async unlikePost(@Param('id') id: string, @User() user: UserJwt) {
    return this.postsService.unlikePost({ postId: id, userId: user.id });
  }
}
