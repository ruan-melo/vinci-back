import { User } from '@prisma/client';
import { AVATAR_FOLDER } from 'src/storage/config/upload/avatar';

export type UserMap = Omit<User, 'password' | 'avatar'> & {
  avatar: string | null;
};

export const AVATAR_PATH =
  process.env.STORAGE_TYPE === 'disk'
    ? `${process.env.APP_URL}/static/${AVATAR_FOLDER}`
    : `${process.env.APP_URL}/static/${AVATAR_FOLDER}`;

export function userMapper({ avatar, ...user }: User): UserMap {
  return {
    ...user,
    avatar: avatar ? `${AVATAR_PATH}/${avatar}` : null,
  };
}
