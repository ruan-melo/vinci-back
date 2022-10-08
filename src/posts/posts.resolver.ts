import { HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import {
  Args,
  Int,
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
import { User as UserParam } from 'src/decorators/user.decorator';
import { Post } from 'src/posts/models/post.model';
import { PostsService } from 'src/posts/posts.service';
import { User } from 'src/users/models/user.model';
import { UsersService } from 'src/users/users.service';
import { CreatePostArgs } from './dto/create-post.args';
import { mediaMapper } from './mappers/mediaMapper';
import { Media } from './models/media.model';

@Resolver((of) => Post)
export class PostsResolver {
  constructor(
    private usersService: UsersService,
    private postsService: PostsService,
  ) {}

  // @UseGuards(JwtAuthGuard)
  @Query((returns) => [Post], { name: 'posts' })
  async getPosts(
    @Args('email', { type: () => String }) email: string,
    @UserParam() user: User,
  ) {
    return this.usersService.findByEmail(email);
  }

  @UseGuards(JwtAuthGuard)
  @Query((returns) => Post, { name: 'post' })
  async getPost(@Args('id', { type: () => String }) id: string) {
    return this.postsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation((returns) => Post)
  @ResolveField('author', (returns) => [User])
  async getAuthor(@Parent() post: Post) {
    const { authorId } = post;
    return this.postsService.findByAuthor(authorId);
  }

  @ResolveField('medias', (returns) => [Media])
  async getMedias(@Parent() post: Post) {
    const { id } = post;
    const medias = await this.postsService.getPostMedias(id);

    return medias.map((m) => mediaMapper(m));
  }
}
