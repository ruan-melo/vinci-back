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

export class CreateUserDto
  implements Omit<Prisma.UserCreateInput, 'id' | 'createdAt' | 'updatedAt'>
{
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
  name: string;

  @MinLength(8)
  @MaxLength(60)
  @IsString()
  password: string;

  @IsEmail()
  @Transform(({ value }: TransformFnParams) => {
    if (typeof value === 'string') {
      return value.trim().toLowerCase();
    }
    return value;
  })
  email: string;

  @MinLength(4)
  @MaxLength(60)
  @IsString()
  @Transform(({ value }: TransformFnParams) => {
    if (typeof value === 'string') {
      return value.trim().toLowerCase();
    }
    return value;
  })
  profile_name: string;
}
