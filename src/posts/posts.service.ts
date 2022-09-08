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
    const filenames = await Promise.all(
      files.map((file) => this.storageProvider.save(file, MEDIA_FOLDER)),
    );

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
      include,
    });
    return post;
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    return `This action updates a #${id} post`;
  }

  async delete({ postId, userId }: { postId: string; userId: string }) {
    const post = await this.prismaService.post.findFirst({
      where: { id: postId },
    });

    if (post.authorId !== userId) {
      throw new Error('Unauthorized');
    }
    await this.prismaService.post.delete({ where: { id: postId } });
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
        likes: {
          where: {
            userId,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    return posts.map((post) => ({
      ...post,
      comments_count: post._count.comments,
      likes_count: post._count.likes,
      liked: post.likes.length > 0,
    }));
  }

  async createComment({
    postId,
    text,
    authorId,
  }: {
    postId: string;
    text: string;
    authorId: string;
  }) {
    const comment = await this.prismaService.comment.create({
      data: {
        text,
        authorId,
        postId,
      },
    });

    return comment;
  }

  async deleteComment({
    commentId,
    userId,
  }: {
    commentId: string;
    userId: string;
  }) {
    const comment = await this.prismaService.comment.findFirst({
      where: { id: commentId },
    });

    if (comment.authorId !== userId) {
      throw new Error('Unauthorized');
    }

    await this.prismaService.comment.delete({ where: { id: commentId } });
  }

  async getComments(postId: string) {
    const comments = await this.prismaService.comment.findMany({
      where: { postId },
      include: { author: true },
    });

    return comments;
  }

  async getLikes(postId: string) {
    const likes = await this.prismaService.reaction.findMany({
      where: { postId },
      include: { user: true },
    });

    return likes;
  }

  async likePost({ postId, userId }: { postId: string; userId: string }) {
    console.log(postId, userId);
    const reaction = await this.prismaService.reaction.create({
      data: {
        postId,
        userId,
      },
    });

    return reaction;
  }

  async unlikePost({ postId, userId }: { postId: string; userId: string }) {
    const reaction = await this.prismaService.reaction.delete({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    return reaction;
  }

  async hasLiked({ postId, userId }: { postId: string; userId: string }) {
    const reaction = await this.prismaService.reaction.findFirst({
      where: {
        postId: postId,
        userId: userId,
      },
    });

    return !!reaction;
  }
}
