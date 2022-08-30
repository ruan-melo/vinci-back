import { Prisma } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
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

export class ExpressMulterFile implements Express.Multer.File {
  @IsString()
  @MinLength(1)
  fieldname: string;

  @IsString()
  @MinLength(1)
  originalname: string;

  @IsString()
  @MinLength(1)
  encoding: string;

  @IsString()
  @MinLength(1)
  mimetype: string;

  @IsNumber()
  size: number;

  stream: Readable;

  @IsString()
  @MinLength(1)
  destination: string;

  @IsString()
  @MinLength(1)
  filename: string;

  @IsString()
  @MinLength(1)
  path: string;
  buffer: Buffer;
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

export class CreatePostDto
  implements
    Omit<
      // Author is not necessary in body of post, it is automatically set to the user who is creating the post
      Prisma.PostUncheckedCreateWithoutAuthorInput,
      'id' | 'comments' | 'reactions' | 'createdAt' | 'updatedAt' | 'medias'
    >
{
  @IsOptional()
  @MaxLength(2200)
  caption: string;

  // @IsNotEmpty()
  // @ValidateNested({ each: true })
  // @Transform(({ value }) => {
  //   if (typeof value === 'string') {
  //     return JSON.parse(value);
  //   }

  //   return value;
  // })
  // medias: CreatePostDtoMedia[];
}
