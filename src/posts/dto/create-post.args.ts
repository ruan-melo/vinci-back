import { ArgsType, Field } from '@nestjs/graphql';
import { Prisma } from '@prisma/client';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  isNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Readable } from 'stream';
import { Stream } from 'stream';

import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';

export interface FileUpload {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream: () => Stream;
}

export class CreatePostDtoMedia {
  // implements
  //   Omit<
  //     Prisma.PostMediaCreateWithoutPostInput,
  //     'id' | 'createdAt' | 'updatedAt' | 'media'
  //   >
  @IsInt()
  @IsPositive()
  position: number;

  @IsInt()
  @IsPositive()
  mediaIndex: string;
}

@ArgsType()
export class CreatePostArgs
  implements
    Omit<
      // Author is not necessary in body of post, it is automatically set to the user who is creating the post
      Prisma.PostUncheckedCreateWithoutAuthorInput,
      'id' | 'comments' | 'reactions' | 'createdAt' | 'updatedAt' | 'medias'
    >
{
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  })
  @MaxLength(2200)
  @Field()
  caption?: string;

  @Field(() => GraphQLUpload)
  media_url: Promise<FileUpload>;
}
