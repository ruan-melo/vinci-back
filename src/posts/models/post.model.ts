import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Post as PrismaPost } from '@prisma/client';
import { Expose } from 'class-transformer';
import { Comment } from './comment.model';
import { Media } from './media.model';
import { Reaction } from './reaction.model';

@ObjectType()
export class Post {
  @Field(() => ID)
  id: string;

  @Field(() => [Reaction], { nullable: true })
  likes?: Reaction[];

  @Field(() => [Comment], { nullable: true })
  comments?: Comment[];

  @Field(() => Int, {
    nullable: true,
  })
  likesCount?: number;

  @Field(() => Int, {
    nullable: true,
  })
  commentsCount?: number;

  @Field({ nullable: true })
  caption?: string;

  @Field({ nullable: true })
  createdAt: Date;

  @Field({ nullable: true })
  updatedAt?: Date;

  // @Field(() => String, { nullable: true })
  // image?: string;

  // @Field(() => [Media], { nullable: true })
  // medias?: Media[];
}
