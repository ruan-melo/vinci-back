import { Prisma, User } from '@prisma/client';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto
  implements Omit<Prisma.UserCreateInput, 'id' | 'createdAt' | 'updatedAt'>
{
  @MinLength(4)
  @MaxLength(255)
  name: string;

  @MinLength(12)
  @MaxLength(60)
  password: string;

  @IsEmail()
  email: string;

  @MinLength(4)
  @MaxLength(60)
  profile_name: string;
}
