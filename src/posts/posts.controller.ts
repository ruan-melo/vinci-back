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
  Comment,
  Post as PrismaPost,
  PostMedia,
  Prisma,
  Reaction,
  User as PrismaUser,
} from '@prisma/client';
import { UserJwt } from 'src/auth/strategies/jwt.strategy';
import { mediaMapper } from './mappers/mediaMapper';
import { commentMapper } from './mappers/commentMapper';
import { AuthOptional, Public } from 'src/auth/guards';
import { userMapper } from 'src/users/mappers/user.mapper';

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

  @AuthOptional()
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Query('medias', new DefaultValuePipe(false), ParseBoolPipe)
    medias: boolean,
    @Query('comments', new DefaultValuePipe(false), ParseBoolPipe)
    comments: boolean,
    @Query('likes_count', new DefaultValuePipe(false), ParseBoolPipe)
    likesCount: boolean,
    @Query('comments_count', new DefaultValuePipe(false), ParseBoolPipe)
    commentsCount: boolean,
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

    const count: Prisma.PostCountOutputTypeArgs = { select: {} };
    if (likesCount) {
      count.select.likes = true;
    }

    if (commentsCount) {
      count.select.comments = true;
    }

    if (count.select.likes || count.select.comments) {
      include._count = count;
    }

    if (likes) {
      include.likes = { include: { user: true } };
    }

    const post = (await this.postsService.findOne(
      id,
      include,
    )) as PrismaPost & {
      likes?: Reaction[];
      medias?: PostMedia[];
      comments?: Comment[];
      author?: PrismaUser;
      _count?: {
        likes?: number;
        comments?: number;
      };
    };

    let hasLiked = false;

    if (user) {
      hasLiked = await this.postsService.hasLiked({
        postId: id,
        userId: user.id,
      });
    }

    console.log('hasLiked', id, user.id);
    return {
      ...post,
      author: post.author ? userMapper(post.author) : null,
      comments_count: post._count?.comments,
      likes_count: post._count?.likes,
      comments: post.comments?.map((comment) => commentMapper(comment)),
      medias: post.medias?.map((media) => mediaMapper(media)) || [],
      liked: hasLiked,
    };
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
