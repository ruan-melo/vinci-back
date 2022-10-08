import { MinLength } from 'class-validator';
import { Field, ArgsType } from '@nestjs/graphql';

@ArgsType()
export class GetUserArgs {
  @Field({ nullable: true })
  id?: string;

  @Field({ nullable: true })
  email?: string;
}
