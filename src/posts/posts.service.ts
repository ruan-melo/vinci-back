import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { MEDIA_FOLDER } from 'src/storage/config/upload/media';
import { StorageProviderInterface } from 'src/storage/storage-provider.interface';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    private prismaService: PrismaService,
    @Inject('StorageProvider')
    private storageProvider: StorageProviderInterface,
  ) {}
  async create(
    authorId: string,
    files: Express.Multer.File[],
    caption?: string,
  ) {
    // Save all medias to storage (Promise.all will wait for all promises to resolve and keep the order)
    console.log('khaliu');
    const filenames = await Promise.all(
      files.map((file) => this.storageProvider.save(file, MEDIA_FOLDER)),
    );

    console.log('CARAMBOLAS', filenames);

    const post = await this.prismaService.post.create({
      data: {
        authorId,
        caption,
        medias: {
          create: filenames.map((filename, index) => ({
            position: index,
            media: filename,
          })),
        },
      },
      include: {
        medias: true,
      },
    });
    return post;
  }

  findAll() {
    return this.prismaService.post.findMany();
  }

  async findOne(id: string, include?: Prisma.PostInclude) {
    const post = await this.prismaService.post.findFirst({
      where: { id },
      // include,
    });
    return post;
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    return `This action updates a #${id} post`;
  }

  async delete(id: string) {
    await this.prismaService.post.delete({ where: { id } });
  }

  async getTimeline(userId: string) {
    const following = await this.prismaService.follow.findMany({
      where: {
        followerId: userId,
      },
      select: {
        followingId: true,
      },
    });

    const followingIds = following.map((follow) => follow.followingId);

    const posts = await this.prismaService.post.findMany({
      where: { authorId: { in: followingIds } },
      include: {
        medias: true,
        author: true,
      },
    });

    return posts;
  }
}
