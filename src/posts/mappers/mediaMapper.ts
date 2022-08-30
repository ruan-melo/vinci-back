import { PostMedia, User } from '@prisma/client';
import { MEDIA_FOLDER } from 'src/storage/config/upload/media';

export type MediaMap = Omit<PostMedia, 'media'> & {
  media_url: string | null;
};

export const MEDIA_PATH =
  process.env.STORAGE_TYPE === 'disk'
    ? `${process.env.APP_URL}/${MEDIA_FOLDER}`
    : `${process.env.APP_URL}/${MEDIA_FOLDER}`;

export function mediaMapper({ media, ...rest }: PostMedia): MediaMap {
  return {
    ...rest,
    media_url: media ? `${MEDIA_PATH}/${media}` : null,
  };
}
