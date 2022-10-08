import { ArgsType, Field } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@ArgsType()
export class CreateCommentArgs {
  @Field(() => String)
  @IsNotEmpty()
  postId: string;

  @Field(() => String)
  @IsNotEmpty()
  text: string;
}
