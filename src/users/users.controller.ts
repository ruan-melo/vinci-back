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
import { Post as PrismaPost, Prisma } from '@prisma/client';
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
import { UserNotFoundException } from './exceptions/UserNotFoundException';
import { User } from 'src/decorators/user.decorator';
import { AuthOptional, Public } from 'src/auth/guards';
import { UserProfile } from './interfaces/user-profile.interface';

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

  @Delete('/avatar')
  async deleteAvatar(@User() user: UserJwt): Promise<UserMap> {
    const updatedUser = await this.usersService.deleteAvatar(user.id);
    return userMapper(updatedUser);
  }

  // @Public()
  @AuthOptional()
  @Get(':profileName')
  async findByProfileName(
    @Request() req: { user: UserJwt },
    @User() user: UserJwt | null,
    @Param('profileName') profileName: string,
    @Query('posts', ParseBoolPipe) includePosts?: boolean,
  ): Promise<UserProfile> {
    const include: Prisma.UserInclude = includePosts
      ? { posts: { include: { medias: true } } }
      : {};

    const profileUser = await this.usersService.findByProfileName(
      profileName,
      include,
    );

    if (!profileUser) {
      throw new UserNotFoundException();
    }

    if ('posts' in profileUser) {
      profileUser.posts = profileUser.posts.map((post) => {
        return {
          ...post,
          medias: post.medias.map((media) => mediaMapper(media)),
        };
      }) as any;
    }

    let follow = false; // default value

    if (user) {
      follow = await this.usersService.isFollowing(
        user.id,
        profileUser.profile_name,
      );
    }

    return { ...userMapper(profileUser), follow };
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

  @Post(':profile_name/follow')
  async follow(
    @Param('profile_name') profile_name: string,
    @User() user: UserJwt,
  ): Promise<void> {
    await this.usersService.follow(user.id, profile_name);
  }

  @Delete(':profile_name/follow')
  async unfollow(
    @Param('profile_name') profile_name: string,
    @User() user: UserJwt,
  ): Promise<void> {
    await this.usersService.unfollow(user.id, profile_name);
  }
}
