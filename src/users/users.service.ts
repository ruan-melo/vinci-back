import { HttpException, Inject, Injectable } from '@nestjs/common';
import { Post, PostMedia, Prisma, User } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { UserAlreadyExistsException } from './exceptions/UserAlreadyExistsException';
import { UserNotFoundException } from './exceptions/UserNotFoundException';
import { StorageProviderInterface } from 'src/storage/storage-provider.interface';
import { AVATAR_FOLDER } from 'src/storage/config/upload/avatar';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private prismaService: PrismaService,
    @Inject('StorageProvider')
    private storageProvider: StorageProviderInterface,
  ) {}

  async findAll(): Promise<User[]> {
    return await this.prismaService.user.findMany();
  }

  async findById(
    userId: string,
    include?: Prisma.UserInclude,
  ): Promise<User & { _count?: { followers?: number; follows?: number } }> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include,
    });
    return user;
  }

  async getUserFollowers(userId: string): Promise<User[]> {
    const userFollowers = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        followers: {
          select: {
            follower: true,
          },
        },
      },
    });

    if (!userFollowers) {
      throw new UserNotFoundException();
    }

    return userFollowers.followers.map((f) => f.follower) || [];
  }

  async getUserFollows(userId: string): Promise<User[]> {
    const userFollowers = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        follows: {
          select: {
            following: true,
          },
        },
      },
    });

    if (!userFollowers) {
      throw new UserNotFoundException();
    }

    return userFollowers.follows.map((f) => f.following) || [];
  }

  async update(userId: string, data: Prisma.UserUpdateInput) {
    const user = await this.prismaService.user.findFirst({
      where: { id: userId },
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    const userUpdated = await this.prismaService.user.update({
      where: { id: userId },
      data,
    });

    return userUpdated;
  }

  async changePassword(
    userId,
    {
      current_password,
      new_password,
    }: { current_password: string; new_password: string },
  ) {
    const user = await this.prismaService.user.findFirst({
      where: { id: userId },
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    const isPasswordCorrect = await bcrypt.compare(
      current_password,
      user.password,
    );

    if (!isPasswordCorrect) {
      throw new HttpException('Current password is incorrect', 401);
    }

    const hashedPassword = await bcrypt.hash(
      new_password,
      Number(process.env.PASSWORD_ROUNDS),
    );

    const userUpdated = await this.prismaService.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return userUpdated;
  }

  async findByProfileName(
    profileName: string,
    include?: Prisma.UserInclude,
  ): Promise<
    User & {
      posts: (Post & {
        medias: PostMedia[];
      })[];
      _count: {
        followers: number;
        follows: number;
      };
    }
  > {
    const user = await this.prismaService.user.findFirst({
      where: { profile_name: profileName },
      include: {
        posts: { include: { medias: true } },
        _count: { select: { followers: true, follows: true } },
      },
    });

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    try {
      return await this.prismaService.user.findUniqueOrThrow({
        where: { email },
        include: {
          posts: {
            include: {
              medias: true,
            },
          },
        },
      });
    } catch {
      throw new UserNotFoundException();
    }
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    const userExists = await this.prismaService.user.findFirst({
      where: {
        OR: [{ email: data.email }, { profile_name: data.profile_name }],
      },
    });

    if (userExists) {
      const errors: any = {};

      if (userExists.email === data.email) {
        errors.email = 'Email is already in use';
      }

      if (userExists.profile_name === data.profile_name) {
        errors.profile_name = 'Profile name is already in use';
      }
      throw new UserAlreadyExistsException(errors);
    }

    const hashedPassword = await bcrypt.hash(
      data.password,
      Number(process.env.PASSWORD_ROUNDS),
    );

    const user = await this.prismaService.user.create({
      data: { ...data, password: hashedPassword },
    });
    return user;
  }

  async delete(id: string): Promise<void> {
    await this.prismaService.user.delete({ where: { id } });
  }

  async isFollowing(
    followerId: string,
    followedProfileName: string,
  ): Promise<boolean> {
    const followed = await this.findByProfileName(followedProfileName);

    if (!followed) {
      throw new UserNotFoundException();
    }
    const follow = await this.prismaService.follow.findFirst({
      where: {
        AND: [{ followerId: followerId }, { followingId: followed.id }],
      },
    });

    return !!follow;
  }

  async updateAvatar(id: string, file: Express.Multer.File) {
    const user = await this.prismaService.user.findFirst({ where: { id } });

    if (!user) {
      throw new UserNotFoundException();
    }

    const filename = await this.storageProvider.save(file, AVATAR_FOLDER);

    if (user.avatar) {
      try {
        await this.storageProvider.delete(user.avatar, AVATAR_FOLDER);
      } catch (e) {
        await this.prismaService.user.update({
          where: { id },
          data: { avatar: null },
        });
      }
    }

    const userUpdated = await this.prismaService.user.update({
      where: { id },
      data: { avatar: filename },
    });

    return userUpdated;
  }

  async deleteAvatar(id: string): Promise<User | null> {
    const user = await this.prismaService.user.findFirst({ where: { id } });

    if (!user) {
      throw new UserNotFoundException();
    }

    if (user.avatar) {
      await this.storageProvider.delete(user.avatar, AVATAR_FOLDER);
    }

    const userUpdated = await this.prismaService.user.update({
      where: { id },
      data: { avatar: null },
    });

    return userUpdated;
  }

  async follow(followerId: string, followingProfileName: string) {
    const followingUser = await this.findByProfileName(followingProfileName);

    if (!followingUser) {
      throw new UserNotFoundException();
    }

    if (followingUser.id === followerId) {
      throw new HttpException('You cannot follow yourself', 400);
    }

    const alreadyFollow = await this.prismaService.follow.findFirst({
      where: {
        AND: [{ followerId: followerId }, { followingId: followingUser.id }],
      },
    });

    if (alreadyFollow) {
      throw new HttpException('You are already following this user', 400);
    }

    return await this.prismaService.follow.create({
      data: {
        followerId,
        followingId: followingUser.id,
      },
    });
  }

  async unfollow(followerId: string, followingProfileName: string) {
    const followingUser = await this.findByProfileName(followingProfileName);

    if (!followingUser) {
      throw new UserNotFoundException();
    }

    const follow = await this.prismaService.follow.findFirst({
      where: {
        AND: [{ followerId: followerId }, { followingId: followingUser.id }],
      },
    });

    if (!follow) {
      throw new HttpException('You are not following this user', 400);
    }

    return await this.prismaService.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId: followingUser.id,
        },
      },
    });
  }
}
