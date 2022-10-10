import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  UseGuards,
} from '@nestjs/common';
import {
  Args,
  Info,
  Int,
  IntersectionType,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import {
  instanceToInstance,
  plainToClass,
  plainToInstance,
} from 'class-transformer';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { JwtAuthGuard } from 'src/auth/guards';
import { UserJwt } from 'src/auth/strategies/jwt.strategy';
import { FieldMap } from 'src/decorators/field-map.decorator';
import { ContextType, User as UserParam } from 'src/decorators/user.decorator';
import { Post } from 'src/posts/models/post.model';
import { PostsService } from 'src/posts/posts.service';
import { User } from 'src/users/models/user.model';
import { UsersService } from 'src/users/users.service';
import { CreatePostArgs } from './dto/create-post.args';
import { mediaMapper } from './mappers/mediaMapper';
import { Media } from './models/media.model';
import { Post as PrismaPost } from '@prisma/client';
import { postMapper } from './mappers/postMapper';
import { CreateCommentArgs } from './dto/create-comment.args';
import { Comment } from './models/comment.model';
import { Reaction } from './models/reaction.model';

type Selection<Type> = {
  [Property in keyof Type]?: boolean;
};

@Resolver((of) => Post)
export class PostsResolver {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    private postsService: PostsService,
  ) {}

  // @UseGuards(JwtAuthGuard)
  @Query((returns) => [Post], { name: 'posts' })
  async getPosts(
    @Args('email', { type: () => String }) email: string,
    // @UserParam() user: User,
  ) {
    return this.usersService.findByEmail(email);
  }

  @UseGuards(JwtAuthGuard)
  @Query((returns) => [Post], { name: 'timeline' })
  async getTimeline(@UserParam(ContextType.GRAPHQL) user: UserJwt) {
    return this.postsService.getTimeline(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Query((returns) => Post, { name: 'post' })
  async getPost(
    @Args('id', { type: () => String }) id: string,
    // @UserParam(ContextType.GRAPHQL) user: UserJwt,
    // @FieldMap()
    // selections: {
    //   likes?: Selection<Reaction>;
    //   comments?: Selection<Comment>;
    //   likesCount?: true;
    //   medias?: Selection<Media>;
    //   commentsCount?: true;
    // },
  ) {
    // const {
    //   likes,
    //   likesCount,
    //   comments: { id: commentId, text },
    //   commentsCount,
    // } = selections;
    // const _post = await this.postsService.findOne(id, {
    //   likes: likes
    //     ? {
    //         select: {
    //           ...likes,
    //         },
    //       }
    //     : false,
    //   comments:
    //     commentId || text
    //       ? {
    //           select: {
    //             id: commentId,
    //             text,
    //           },
    //         }
    //       : false,

    //   _count:
    //     likesCount || commentsCount
    //       ? {
    //           select: {
    //             likes: !!likesCount,
    //             comments: !!commentsCount,
    //           },
    //         }
    //       : false,
    // });

    const post = this.postsService.findOne(id);

    // console.log('USer', user);

    if (!post) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }

    return post;
  }

  @UseGuards(JwtAuthGuard)
  @Mutation((returns) => Post)
  async likePost(
    @Args('postId', { type: () => String }) postId: string,
    @UserParam(ContextType.GRAPHQL) user: UserJwt,
  ) {
    const post = await this.postsService.findOne(postId);

    if (!post) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }

    const alreadyLiked = await this.postsService.hasLiked({
      postId,
      userId: user.id,
    });

    if (alreadyLiked) {
      throw new HttpException('Post already liked', HttpStatus.BAD_REQUEST);
    }

    const like = await this.postsService.likePost({
      postId,
      userId: user.id,
    });

    // !! FIX RETURN TYPE

    return post;
  }

  @UseGuards(JwtAuthGuard)
  @Mutation((returns) => String)
  async deletePost(
    @Args('postId', { type: () => String }) id: string,
    @UserParam(ContextType.GRAPHQL) user: UserJwt,
  ) {
    await this.postsService.delete({
      postId: id,
      userId: user.id,
    });

    return 'deleted';
  }

  @UseGuards(JwtAuthGuard)
  @Mutation((returns) => Post)
  async unlikePost(
    @Args('postId', { type: () => String }) postId: string,
    @UserParam(ContextType.GRAPHQL) user: UserJwt,
  ) {
    const post = await this.postsService.findOne(postId);

    if (!post) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }

    const liked = await this.postsService.hasLiked({
      postId,
      userId: user.id,
    });

    if (!liked) {
      throw new HttpException('Post not liked', HttpStatus.BAD_REQUEST);
    }

    await this.postsService.unlikePost({
      postId,
      userId: user.id,
    });

    // !! FIX RETURN TYPE

    return post;
  }

  @UseGuards(JwtAuthGuard)
  @Mutation((returns) => String)
  async deleteComment(
    @Args('commentId', { type: () => String }) commentId: string,
    @UserParam(ContextType.GRAPHQL) user: UserJwt,
  ) {
    const comment = await this.postsService.getComment(commentId);

    if (!comment) {
      throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
    }

    if (comment.authorId !== user.id) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    await this.postsService.deleteComment(commentId);

    return 'deleted';
  }

  // @UseGuards(JwtAuthGuard)
  @Query((returns) => [Comment], { name: 'comments' })
  async getPostComments(
    @Args('postId', { type: () => String }) postId: string,
  ): Promise<Comment[]> {
    const comments = await this.postsService.getComments(postId);

    return comments;
  }

  @UseGuards(JwtAuthGuard)
  @Mutation((returns) => Post)
  async comment(
    @Args() data: CreateCommentArgs,
    @UserParam(ContextType.GRAPHQL) user: UserJwt,
  ) {
    const { postId, text } = data;
    const post = await this.postsService.findOne(postId);

    if (!post) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }

    const comment = await this.postsService.createComment({
      authorId: user.id,
      postId,
      text,
    });

    return post;
  }

  // @Mutation((returns) => Post)
  @UseGuards(JwtAuthGuard)
  @ResolveField('author', (returns) => User)
  async getAuthor(@Parent() post: PrismaPost) {
    const { authorId } = post;

    const author = await this.usersService.findById(authorId);

    return author;
  }

  @ResolveField('likes', (returns) => [Reaction])
  async getLikes(@Parent() post: PrismaPost) {
    const { id } = post;
    const likes = await this.postsService.getLikes(id);
    return likes;
  }

  @ResolveField('likesCount', (returns) => Int)
  async getLikesCount(@Parent() post: PrismaPost & { likes?: Reaction[] }) {
    const likesCount = (await this.postsService.findOne(post.id, {
      _count: { select: { likes: true } },
    })) as { _count: { likes: number } };

    return likesCount._count.likes;
  }

  @ResolveField('comments', (returns) => [Comment])
  async getComments(@Parent() post: PrismaPost) {
    const { id } = post;
    const comments = await this.postsService.getComments(id);
    return comments;
  }

  @ResolveField('commentsCount', (returns) => Int)
  async getCommentsCount(
    @Parent() post: PrismaPost & { comments?: Comment[] },
  ) {
    const commentsCount = (await this.postsService.findOne(post.id, {
      _count: { select: { comments: true } },
    })) as { _count: { comments: number } };

    return commentsCount._count.comments;
  }

  @ResolveField('medias', (returns) => [Media])
  async getMedias(@Parent() post: Post) {
    const { id } = post;
    const medias = await this.postsService.getPostMedias(id);

    return medias.map((m) => mediaMapper(m));
  }

  @UseGuards(JwtAuthGuard)
  @ResolveField('liked', (returns) => Boolean)
  async hasLiked(
    @Parent() post: Post & { authorId: string },
    @UserParam(ContextType.GRAPHQL) user: UserJwt,
  ) {
    const { id } = post;

    const liked = await this.postsService.hasLiked({
      postId: id,
      userId: user.id,
    });

    // console.log('liked', id, author);
    return liked;
  }
}
