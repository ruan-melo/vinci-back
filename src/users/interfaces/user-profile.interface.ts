import { Post } from '@prisma/client';
import { MediaMap } from 'src/posts/mappers/mediaMapper';
import { UserMap } from '../mappers/user.mapper';

export type UserProfile = { follow: boolean } & (
  | UserMap
  | (UserMap & { posts: Post & { medias: MediaMap } })
  | (UserMap & { posts: Post & { medias: MediaMap } } & {
      followers_count: number;
      following_count: number;
    })
);
