import { forwardRef, Inject, UseGuards } from '@nestjs/common';
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
import { ContextType, User as UserParam } from 'src/decorators/user.decorator';
import { UserJwt } from 'src/auth/strategies/jwt.strategy';
import { EditProfileArgs } from './dto/edit-profile.args';

@Resolver((of) => User)
export class UsersResolver {
  constructor(
    private usersService: UsersService,
    @Inject(forwardRef(() => PostsService))
    private postsService: PostsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Query((returns) => User, { name: 'profile' })
  async getProfile(
    @Args('profile_name', { type: () => String }) profile_name: string,
  ) {
    return this.usersService.findByProfileName(profile_name);
  }

  // @UseGuards(JwtAuthGuard)
  // @Query((returns) => User, { name: 'user' })
  // async getUser(@Args('userId', { type: () => String }) userID: string) {
  //   return this.usersService.findById(userID);
  // }

  @UseGuards(JwtAuthGuard)
  @Query((returns) => [User], { name: 'users' })
  async getUsers() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Mutation((returns) => User)
  async editProfile(
    @UserParam(ContextType.GRAPHQL) user: UserJwt,
    @Args() data: EditProfileArgs,
  ) {
    return this.usersService.update(user.id, data);
  }

  @Mutation((returns) => User)
  async createUser(@Args() args: CreateUserArgs) {
    return this.usersService.create(args);
  }

  @Mutation((returns) => User)
  async changePassword(
    @Args('oldPassword', { type: () => String }) oldPassword: string,
    @Args('newPassword', { type: () => String }) newPassword: string,
    @UserParam(ContextType.GRAPHQL) user: UserJwt,
  ) {
    return this.usersService.changePassword(user.id, {
      current_password: oldPassword,
      new_password: newPassword,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Mutation((returns) => String)
  async follow(
    @Args('profile_name', { type: () => String }) profile_name: string,
    @UserParam(ContextType.GRAPHQL) user: UserJwt,
  ) {
    await this.usersService.follow(user.id, profile_name);
    return 'followed';
  }

  @Mutation((returns) => User)
  async deleteAvatar(@UserParam(ContextType.GRAPHQL) user: UserJwt) {
    return this.usersService.deleteAvatar(user.id);
  }

  @Mutation((returns) => String)
  async unfollow(
    @Args('profile_name', { type: () => String }) profile_name: string,
    @UserParam(ContextType.GRAPHQL) user: UserJwt,
  ) {
    await this.usersService.unfollow(user.id, profile_name);
    return 'unfollowed';
  }

  @ResolveField('posts', (returns) => [Post])
  async getPosts(@Parent() author: User) {
    const { id } = author;
    return this.postsService.findByAuthor(id);
  }

  @ResolveField('followers', (returns) => [User])
  async getFollowers(@Parent() user: User) {
    const { id } = user;

    return this.usersService.getUserFollowers(id);
  }

  @ResolveField('followersCount', (returns) => Int)
  async getFollowersCount(@Parent() user: User) {
    const { id } = user;

    const userFollowersCount = await this.usersService.findById(id, {
      _count: { select: { followers: true } },
    });
    return userFollowersCount._count.followers || 0;
  }

  @ResolveField('follows', (returns) => [User])
  async getFollows(@Parent() user: User) {
    const { id } = user;

    return this.usersService.getUserFollows(id);
  }

  @ResolveField('followsCount', (returns) => Int)
  async getFollowsCount(@Parent() user: User) {
    const { id } = user;

    const userFollowsCount = await this.usersService.findById(id, {
      _count: { select: { follows: true } },
    });
    return userFollowsCount._count.follows || 0;
  }
}
