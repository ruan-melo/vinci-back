import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
// import { TokensService } from '../notifications/tokens.service';
import { UsersResolver } from './users.resolver';
import { PostsModule } from 'src/posts/posts.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    forwardRef(() => PostsModule),
    forwardRef(() => NotificationsModule),
  ],
  providers: [UsersService, UsersResolver],
  controllers: [UsersController],
  exports: [UsersService, UsersResolver],
})
export class UsersModule {}
