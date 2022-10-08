import {
  Post as PrismaPost,
  Comment as PrismaComment,
  PostMedia,
  Prisma,
  Reaction,
} from '@prisma/client';
import { Post } from '../models/post.model';

type PostIncludeOutput = Partial<{
  medias: PostMedia[];
  likes: Reaction[];
  comments: PrismaComment[];
}>;

type PostWithCountAndInclude = PrismaPost &
  PostIncludeOutput & { _count?: Partial<Prisma.PostCountOutputType> };

export function postMapper({ _count, ...rest }: PostWithCountAndInclude): Post {
  return {
    ...rest,
    likesCount: _count?.likes,
    commentsCount: _count?.comments,
  };
}
