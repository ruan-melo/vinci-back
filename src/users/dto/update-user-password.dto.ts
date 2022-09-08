import { PickType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserPasswordDto extends PickType(CreateUserDto, [
  'password',
]) {
  @IsNotEmpty()
  @IsString()
  current_password: string;
}
