import { ArgsType, OmitType, PartialType } from '@nestjs/graphql';
import { CreateUserArgs } from './create-user.args';

@ArgsType()
export class EditProfileArgs extends PartialType(
  OmitType(CreateUserArgs, ['password'] as const),
) {}
