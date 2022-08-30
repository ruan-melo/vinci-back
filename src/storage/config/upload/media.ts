import {
  ArgumentMetadata,
  BadRequestException,
  ParseFilePipeBuilder,
  PipeTransform,
} from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { resolve } from 'path';
import { defaultDiskStorageConfig, tmpFolder } from '.';

export class MediaFilesValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // Verify if the value is an array[]
    if (typeof value !== 'object' || !Array.isArray(value)) {
      throw new BadRequestException('Invalid files');
    }

    // Verify if the array has at least one element
    if (value.length === 0) {
      throw new BadRequestException('Must have at least one file');
    }

    // Verify if elements are files
    value.forEach((file) => {
      if (
        typeof file !== 'object' ||
        !(file as object).hasOwnProperty('originalname')
      ) {
        throw new BadRequestException('Invalid file');
      }
    }),
      // Verify if the files  are valid
      value.forEach((file) => {
        if (
          (file as Express.Multer.File)['mimetype'].match(
            /^image\/(jpeg|png|jpg|bmp)$/i,
          ) === null
        ) {
          throw new BadRequestException('Invalid file format');
        }

        if ((file as Express.Multer.File)['size'] > 1000 * 1000 * 10) {
          throw new BadRequestException('Invalid file size');
        }
      });
    return value;
  }
}
export const MEDIA_FOLDER = 'medias';

export const uploadMediaConfig: MulterOptions = {
  storage: diskStorage({
    ...defaultDiskStorageConfig,

    destination: resolve(tmpFolder, MEDIA_FOLDER),
  }),
};
