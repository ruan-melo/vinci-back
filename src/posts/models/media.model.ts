import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';
// import { Expose } from 'class-transformer';
import { PostMedia } from 'prisma/prisma-client';
import { MEDIA_FOLDER } from 'src/storage/config/upload/media';

export const MEDIA_PATH =
  process.env.STORAGE_TYPE === 'disk'
    ? `${process.env.APP_URL}/${MEDIA_FOLDER}`
    : `${process.env.APP_URL}/${MEDIA_FOLDER}`;

@ObjectType()
export class Media {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  position: number;

  media: string;

  @Field(() => String)
  media_url: string;

  @Field(() => Date, { nullable: true })
  createdAt: Date;

  @Field(() => Date, { nullable: true })
  updatedAt: Date;
}
