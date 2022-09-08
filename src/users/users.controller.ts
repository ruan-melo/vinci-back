import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseBoolPipe,
  ParseFilePipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Post as PrismaPost, Prisma, User as PrismaUser } from '@prisma/client';
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
import { OptionalQuery } from 'src/decorators/optional-query.decorator';
import { UserAllProfile } from './interfaces/user-all-profile.interface';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';

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

  @Put('profile')
  async updateProfile(
    @User() user: UserJwt,
    @Body() data: UpdateUserProfileDto,
  ) {
    const updatedUser = await this.usersService.update(user.id, data);

    return userMapper(updatedUser);
  }

  @Patch('/avatar')
  @UseInterceptors(FileInterceptor('file', uploadAvatarConfig))
  async updateAvatar(
    @Req() req: { user: UserJwt },
    @UploadedFile(ParseAvatarFilePipe)
    file: Express.Multer.File,
  ): Promise<UserMap> {
    const user = await this.usersService.updateAvatar(req.user.id, file);
    // console.log('body');
    return userMapper(user);
  }

  @Patch('/password')
  async updatePassword(
    @Body() data: UpdateUserPasswordDto,
    @User() user: UserJwt,
  ) {
    await this.usersService.updatePassword(user.id, data);
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
    @Query('posts', new DefaultValuePipe(false), ParseBoolPipe)
    includePosts: boolean,
    @Query('followers_count', new DefaultValuePipe(false), ParseBoolPipe)
    followers: boolean,
    @Query('following_count', new DefaultValuePipe(false), ParseBoolPipe)
    following: boolean,
  ): Promise<UserProfile> {
    const include: Prisma.UserInclude = {
      posts: { include: { medias: true } },
      _count: {
        select: {
          followers: true,
          follows: true,
        },
      },
    };

    if (includePosts) {
      include.posts = { include: { medias: true } };
    }

    const profileUser = (await this.usersService.findByProfileName(
      profileName,
      include,
    )) as UserAllProfile;

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

    return {
      ...userMapper(profileUser),
      follow,
      followers_count: profileUser._count.followers,
      following_count: profileUser._count.follows,
    };
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
