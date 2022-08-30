import { User } from '@prisma/client';
import { AVATAR_FOLDER } from 'src/storage/config/upload/avatar';

export type UserMap = Omit<User, 'password' | 'avatar'> & {
  avatar_url: string | null;
};

export const AVATAR_PATH =
  process.env.STORAGE_TYPE === 'disk'
    ? `${process.env.APP_URL}/${AVATAR_FOLDER}`
    : `${process.env.APP_URL}/${AVATAR_FOLDER}`;

export function userMapper({ password, avatar, ...user }: User): UserMap {
  return {
    ...user,
    avatar_url: avatar ? `${AVATAR_PATH}/${avatar}` : null,
  };
}
