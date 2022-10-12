import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { User as UserPrisma } from '@prisma/client';
import { Post } from 'src/posts/models/post.model';

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  avatar?: string;

  @Field({ nullable: true })
  email: string;

  @Field({ nullable: true })
  profile_name?: string;

  @Field({ nullable: true })
  createdAt?: Date;

  @Field({ nullable: true })
  updatedAt?: Date;

  // @Field(() => [Post], { nullable: true })
  // posts: Post[];
}
