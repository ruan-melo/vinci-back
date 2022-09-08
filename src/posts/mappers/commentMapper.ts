import { Comment, PostMedia, User } from '@prisma/client';
import { MEDIA_FOLDER } from 'src/storage/config/upload/media';
import { UserMap, userMapper } from 'src/users/mappers/user.mapper';

export type CommentMap = Omit<Comment, 'author'> & {
  author?: UserMap;
};

export const MEDIA_PATH =
  process.env.STORAGE_TYPE === 'disk'
    ? `${process.env.APP_URL}/${MEDIA_FOLDER}`
    : `${process.env.APP_URL}/${MEDIA_FOLDER}`;

export function commentMapper({
  author,
  ...rest
}: Comment & { author?: User }): CommentMap {
  const comment: CommentMap = { ...rest };

  if (author) {
    comment.author = userMapper(author);
  }

  return comment;
}
