import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class FollowNotification {
  @Field(() => ID)
  id: string;

  followerId: string;

  @Field(() => String)
  timestamp: string;

  @Field(() => Boolean)
  read: boolean;
}
