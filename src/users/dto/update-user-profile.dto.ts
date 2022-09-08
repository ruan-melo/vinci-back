import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserProfileDto extends PartialType(
  OmitType(CreateUserDto, ['password']),
) {}
