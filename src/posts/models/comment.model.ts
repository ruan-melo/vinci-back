import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Comment as PrismaComment } from '@prisma/client';
import { Expose } from 'class-transformer';
import { Media } from './media.model';

@ObjectType()
export class Comment {
  authorId: string;

  @Field(() => String)
  id: string;

  @Field(() => String, { nullable: true })
  text?: string;

  // @Field(() => [Media], { nullable: true })
  // medias?: Media[];
}
