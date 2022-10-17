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
import { NotificationsService } from 'src/notifications/notifications.service';
import { User as UserParam } from '../decorators/user.decorator';
import { UserJwt } from 'src/auth/strategies/jwt.strategy';
import { UsersService } from 'src/users/users.service';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly notificationsService: NotificationsService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 5, uploadMediaConfig))
  async create(
    @UserParam() user: UserJwt,
    @UploadedFiles(MediaFilesValidationPipe) files: Express.Multer.File[],
    @Body() createPostDto: CreatePostDto,
  ) {
    const post = await this.postsService.create(
      user.id,
      files,
      createPostDto.caption,
    );

    const fullUser = await this.usersService.findById(user.id);

    this.notificationsService.sendPostNotification({
      author: {
        id: fullUser.id,
        name: fullUser.name,
        profile_name: fullUser.profile_name,
      },
      post: {
        caption: post.caption,
        id: post.id,
      },
    });
    return post;
  }
}
