import { ArgsType, Field } from '@nestjs/graphql';
import { PickType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';
import { CreateUserArgs } from './create-user.args';

@ArgsType()
export class UpdateUserPasswordArgs extends PickType(CreateUserArgs, [
  'password',
]) {
  @IsNotEmpty()
  @IsString()
  @Field()
  currentPassword: string;
}
