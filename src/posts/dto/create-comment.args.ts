import { ArgsType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@ArgsType()
export class CreateCommentArgs {
  @Field(() => ID)
  @IsNotEmpty()
  postId: string;

  @Field(() => String)
  @IsNotEmpty()
  text: string;
}
