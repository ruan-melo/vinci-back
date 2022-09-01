import { Post, PostMedia, User } from '@prisma/client';

export type UserAllProfile = User &
  Partial<{
    _count: {
      followers: number;
      follows: number;
    };
    posts: (Post & {
      medias: PostMedia[];
    })[];
  }>;
