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

  async findByProfileName(
    profileName: string,
    include?: Prisma.UserInclude,
  ): Promise<
    | User
    | (User & {
        posts: (Post & {
          medias: PostMedia[];
        })[];
      })
  > {
    const user = await this.prismaService.user.findFirst({
      where: { profile_name: profileName },
      include,
    });

    if (!user) {
      throw new UserNotFoundException();
    }

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
}
