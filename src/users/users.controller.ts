import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseBoolPipe,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  Req,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Post as PrismaPost, Prisma, User } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserJwt } from 'src/auth/strategies/jwt.strategy';
import {
  ParseAvatarFilePipe,
  uploadAvatarConfig,
} from 'src/storage/config/upload/avatar';
import { UserMap, userMapper } from './mappers/user.mapper';
import { MediaMap, mediaMapper } from 'src/posts/mappers/mediaMapper';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async findAll(): Promise<UserMap[]> {
    const users = (await this.usersService.findAll()).map(userMapper);
    return users;
  }

  @Get('profile')
  async getProfile(@Request() req) {
    const user = await this.usersService.findByEmail(req.user.email);
    return userMapper(user);
  }

  @Get(':profileName')
  async findByProfileName(
    @Param('profileName') profileName: string,
    @Query('posts', ParseBoolPipe) includePosts?: boolean,
  ): Promise<
    UserMap | (UserMap & { posts: PrismaPost & { medias: MediaMap } })
  > {
    const include: Prisma.UserInclude = includePosts
      ? { posts: { include: { medias: true } } }
      : {};
    const user = await this.usersService.findByProfileName(
      profileName,
      include,
    );

    if ('posts' in user) {
      user.posts = user.posts.map((post) => {
        return {
          ...post,
          medias: post.medias.map((media) => mediaMapper(media)),
        };
      }) as any;
    }

    return userMapper(user);
  }

  // @Post()
  // async create(@Body() data: CreateUserDto): Promise<UserMap> {
  //   const user = await this.usersService.create(data);

  //   return userMapper(user);
  // }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    await this.usersService.delete(id);
  }

  @Patch('/avatar')
  @UseInterceptors(FileInterceptor('file', uploadAvatarConfig))
  async updateAvatar(
    @Req() req: { user: UserJwt },
    @UploadedFile(ParseAvatarFilePipe)
    file: Express.Multer.File,
  ): Promise<UserMap> {
    const user = await this.usersService.updateAvatar(req.user.id, file);
    return userMapper(user);
  }
}
