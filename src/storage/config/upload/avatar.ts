import { ParseFilePipeBuilder } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { resolve } from 'path';
import { defaultDiskStorageConfig, tmpFolder } from '.';

export const ParseAvatarFilePipe = new ParseFilePipeBuilder()
  .addFileTypeValidator({
    fileType: '(jpeg|png|jpg|bmp)',
  })
  .addMaxSizeValidator({
    maxSize: 1000 * 1000,
  })
  .build({
    fileIsRequired: true,
  });

export const AVATAR_FOLDER = 'avatars';

export const uploadAvatarConfig: MulterOptions = {
  storage: diskStorage({
    ...defaultDiskStorageConfig,

    destination: resolve(tmpFolder, AVATAR_FOLDER),
  }),
};
