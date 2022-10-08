import { UseGuards } from '@nestjs/common';
import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { JwtAuthGuard } from 'src/auth/guards';
import { Post } from 'src/posts/models/post.model';
import { PostsService } from 'src/posts/posts.service';
import { CreateUserArgs } from './dto/create-user.args';
import { GetUserArgs } from './dto/get-user.args';
import { User } from './models/user.model';
import { UsersService } from './users.service';

@Resolver((of) => User)
export class UsersResolver {
  constructor(
    private usersService: UsersService,
    private postsService: PostsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Query((returns) => User, { name: 'user' })
  async getUserByEmail(@Args('email', { type: () => String }) email: string) {
    return this.usersService.findByEmail(email);
  }

  @Mutation((returns) => User)
  async createUser(@Args() args: CreateUserArgs) {
    return this.usersService.create(args);
  }

  @ResolveField('posts', (returns) => [Post])
  async getPosts(@Parent() author: User) {
    const { id } = author;
    return this.postsService.findByAuthor(id);
  }
}
