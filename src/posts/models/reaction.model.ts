import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Reaction as PrismaReaction } from '@prisma/client';
import { Expose } from 'class-transformer';
import { User } from 'src/users/models/user.model';
import { Media } from './media.model';

@ObjectType()
export class Reaction {
  @Field(() => String)
  postId: string;

  @Field(() => String)
  userId: string;

  @Field(() => User, { nullable: true })
  user?: User;
}
