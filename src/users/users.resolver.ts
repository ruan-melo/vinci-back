import {
  forwardRef,
  HttpException,
  Inject,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { AuthOptional, JwtAuthGuard } from 'src/auth/guards';
import { Post } from 'src/posts/models/post.model';
import { PostsService } from 'src/posts/posts.service';
import { CreateUserArgs } from './dto/create-user.args';
import { GetUserArgs } from './dto/get-user.args';
import { User } from './models/user.model';
import { UsersService } from './users.service';
import { ContextType, User as UserParam } from 'src/decorators/user.decorator';
import { UserJwt } from 'src/auth/strategies/jwt.strategy';
import { EditProfileArgs } from './dto/edit-profile.args';
import { UpdateUserPasswordArgs } from './dto/update-user-password.args';
import { HttpExceptionFilter } from 'src/filters/HttpExceptionFilter';
import { userMapper } from './mappers/user.mapper';
import { NotificationsService } from 'src/notifications/notifications.service';

@UseFilters(new HttpExceptionFilter())
@Resolver((of) => User)
export class UsersResolver {
  constructor(
    private usersService: UsersService,
    @Inject(forwardRef(() => PostsService))
    private postsService: PostsService,
    private notificationsService: NotificationsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @AuthOptional()
  @Query((returns) => User, { name: 'profile' })
  async getProfile(
    @Args('profile_name', { type: () => String, nullable: true })
    profile_name?: string,
    @UserParam(ContextType.GRAPHQL) user?: UserJwt,
  ) {
    if (profile_name) {
      const user = await this.usersService.findByProfileName(profile_name);

      if (!user) {
        throw new HttpException('Not found', 404);
      }
      return userMapper(user);
    }

    if (user) {
      const findUser = await this.usersService.findById(user.id);

      return userMapper(findUser);
    }

    throw new HttpException('Not found', 404);
  }

  @Query((returns) => [User])
  async searchUser(
    @Args('search', { type: () => String }) search: string,
    // @UserParam(ContextType.GRAPHQL) user?: UserJwt,
  ) {
    const users = await this.usersService.searchUsers(search);
    return users.map((user) => userMapper(user));
  }

  @UseGuards(JwtAuthGuard)
  @AuthOptional()
  @ResolveField('followed', (returns) => Boolean)
  async isFollowing(
    @Parent() user: User,
    @UserParam(ContextType.GRAPHQL) loggedUser?: UserJwt,
  ) {
    if (!loggedUser) {
      return false;
    }

    const followed = await this.usersService.isFollowing(
      loggedUser.id,
      user.profile_name,
    );

    return followed;
  }

  // @UseGuards(JwtAuthGuard)
  // @Query((returns) => [User], { name: 'users' })
  // async getUsers() {
  //   const users = this.usersService.findAll();
  //   return userMapper;
  // }

  @UseGuards(JwtAuthGuard)
  @Mutation((returns) => User)
  async editProfile(
    @UserParam(ContextType.GRAPHQL) user: UserJwt,
    @Args() data: EditProfileArgs,
  ) {
    const userUpdated = await this.usersService.update(user.id, data);
    return userMapper(userUpdated);
  }

  @Mutation((returns) => User)
  async createUser(@Args() args: CreateUserArgs) {
    return this.usersService.create(args);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation((returns) => User)
  async editPassword(
    @Args() data: UpdateUserPasswordArgs,
    @UserParam(ContextType.GRAPHQL) user: UserJwt,
  ) {
    const { currentPassword, password } = data;

    const updatedUser = await this.usersService.changePassword(user.id, {
      current_password: currentPassword,
      new_password: password,
    });

    return userMapper(updatedUser);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation((returns) => String)
  async follow(
    @Args('profile_name', { type: () => String }) profile_name: string,
    @UserParam(ContextType.GRAPHQL) user: UserJwt,
  ) {
    await this.usersService.follow(user.id, profile_name);
    const userFollowed = await this.usersService.findByProfileName(
      profile_name,
    );

    const follower = await this.usersService.findById(user.id);

    this.notificationsService.sendFollowNotification({
      follower: {
        ...follower,
      },
      followingId: userFollowed.id,
    });

    this.notificationsService.updatePostPreference({
      authorId: userFollowed.id,
      userId: user.id,
      preference: true,
    });
    return 'followed';
  }

  @Mutation((returns) => User)
  async deleteAvatar(@UserParam(ContextType.GRAPHQL) user: UserJwt) {
    const updatedUser = await this.usersService.deleteAvatar(user.id);
    return userMapper(updatedUser);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation((returns) => String)
  async unfollow(
    @Args('profile_name', { type: () => String }) profile_name: string,
    @UserParam(ContextType.GRAPHQL) user: UserJwt,
  ) {
    await this.usersService.unfollow(user.id, profile_name);
    const userUnfollowed = await this.usersService.findByProfileName(
      profile_name,
    );
    this.notificationsService.updatePostPreference({
      authorId: userUnfollowed.id,
      userId: user.id,
      preference: false,
    });

    return 'unfollowed';
  }

  @ResolveField('posts', (returns) => [Post])
  async getPosts(@Parent() author: User) {
    const { id } = author;
    const posts = await this.postsService.findByAuthor(id);

    return posts;
  }

  @ResolveField('followers', (returns) => [User])
  async getFollowers(@Parent() user: User) {
    const { id } = user;

    const users = await this.usersService.getUserFollowers(id);
    return users.map((user) => userMapper(user));
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

    const users = await this.usersService.getUserFollows(id);
    return users.map((user) => userMapper(user));
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
