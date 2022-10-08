import { ArgsType, Field } from '@nestjs/graphql';
import { Prisma, User } from '@prisma/client';
import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
// import {Trim} from 'class-transformer';

@ArgsType()
export class CreateUserArgs {
  @MinLength(4)
  @MaxLength(255)
  @Transform(({ value }: TransformFnParams) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  })
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  name: string;

  @MinLength(8)
  @MaxLength(60)
  @IsString()
  @Field(() => String)
  password: string;

  @IsEmail()
  @Transform(({ value }: TransformFnParams) => {
    if (typeof value === 'string') {
      return value.trim().toLowerCase();
    }
    return value;
  })
  @Field(() => String)
  email: string;

  @MinLength(4)
  @MaxLength(60)
  @IsString()
  @Transform(({ value }: TransformFnParams) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  })
  @Field(() => String)
  profile_name: string;
}
