import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { userMapper } from 'src/users/mappers/user.mapper';
import { User } from 'src/users/models/user.model';
import { UsersService } from 'src/users/users.service';
import { Comment } from './models/comment.model';

@Resolver((of) => Comment)
export class CommentsResolver {
  constructor(private usersService: UsersService) {}

  @ResolveField('author', (returns) => User)
  async author(@Parent() comment: Comment): Promise<User> {
    const user = await this.usersService.findById(comment.authorId);
    return userMapper(user);
  }
}
