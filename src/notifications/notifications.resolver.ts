import {
  Args,
  ID,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { UsersService } from 'src/users/users.service';
import { FollowNotification as FollowNotificationModel } from './models/follow-notification.model';
import { ContextType, User as UserParam } from 'src/decorators/user.decorator';
import { UserJwt } from 'src/auth/strategies/jwt.strategy';
import { NotificationsService } from './notifications.service';
import { HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards';
import { userMapper } from 'src/users/mappers/user.mapper';
import { User } from 'src/users/models/user.model';

@Resolver((of) => FollowNotificationModel)
export class NotificationsResolver {
  constructor(
    private usersService: UsersService,
    private notificationsService: NotificationsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Query((returns) => [FollowNotificationModel], { name: 'notifications' })
  async getNotifications(
    @UserParam(ContextType.GRAPHQL) user: UserJwt,
  ): Promise<FollowNotificationModel[]> {
    const notificationsObject =
      await this.notificationsService.getAllUserNotifications(user.id);

    const notifications = Object.keys(notificationsObject).map((key) => ({
      id: key,
      ...notificationsObject[key],
    }));

    return notifications;
  }

  @UseGuards(JwtAuthGuard)
  @Query((returns) => FollowNotificationModel, { name: 'notification' })
  async getNotification(
    @Args('id', { type: () => ID }) id: string,
    @UserParam(ContextType.GRAPHQL) user: UserJwt,
  ) {
    const notification = await this.notificationsService.getUserNotification(
      user.id,
      id,
    );

    if (!notification) {
      throw new HttpException('Notification not found', HttpStatus.NOT_FOUND);
    }

    return notification;
  }

  @UseGuards(JwtAuthGuard)
  @Mutation((returns) => FollowNotificationModel, { name: 'readNotification' })
  async markNotificationAsRead(
    @Args('id', { type: () => ID }) id: string,
    @UserParam(ContextType.GRAPHQL) user: UserJwt,
  ) {
    const notification = await this.notificationsService.markNotificationAsRead(
      user.id,
      id,
    );

    return notification;
  }

  @UseGuards(JwtAuthGuard)
  @Mutation((returns) => [FollowNotificationModel], {
    name: 'readAllNotifications',
  })
  async markAllNotificationAsRead(
    @UserParam(ContextType.GRAPHQL) user: UserJwt,
  ) {
    const notifications =
      await this.notificationsService.markAllNotificationAsRead(user.id);

    return notifications;
  }

  @UseGuards(JwtAuthGuard)
  @ResolveField('follower', (returns) => User)
  async getFollower(@Parent() notification: FollowNotificationModel) {
    const { followerId } = notification;

    const author = await this.usersService.findById(followerId);

    return userMapper(author);
  }
}
