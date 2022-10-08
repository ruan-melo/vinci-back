import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Post as PrismaPost } from '@prisma/client';
import { Expose } from 'class-transformer';
import { Media } from './media.model';

@ObjectType()
export class Post {
  @Field(() => String)
  id: string;

  // @Field(() => String)
  authorId: string;

  @Field({ nullable: true })
  caption?: string;

  @Field({ nullable: true })
  createdAt: string;

  @Field({ nullable: true })
  updatedAt?: Date;

  @Field(() => String, { nullable: true })
  image?: string;

  // @Field(() => [Media], { nullable: true })
  // medias?: Media[];
}
