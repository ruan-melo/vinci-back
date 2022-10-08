import { forwardRef, Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PostsResolver } from './posts.resolver';
import { CommentsResolver } from './comments.resolver';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [forwardRef(() => UsersModule)],
  controllers: [PostsController],
  providers: [PostsService, PostsResolver, CommentsResolver],
  exports: [PostsService],
})
export class PostsModule {}
