import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Reaction as PrismaReaction } from '@prisma/client';
import { Expose } from 'class-transformer';
import { Media } from './media.model';

@ObjectType()
export class Reaction {
  @Field(() => String)
  postId: string;

  @Field(() => String)
  userId: string;

  // @Field(() => [Media], { nullable: true })
  // medias?: Media[];
}
