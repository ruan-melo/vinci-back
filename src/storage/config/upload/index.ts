import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { resolve } from 'path';
import { randomBytes } from 'crypto';

export const tmpFolder = resolve(__dirname, '..', '..', '..', '..', 'temp');

export const defaultDiskStorageConfig = {
  destination: tmpFolder,
  filename: (req, file, cb) => {
    const fileHash = randomBytes(16).toString('hex');

    const fileExtension = file.originalname.match(/\.[0-9a-z]+$/i);
    return cb(null, fileHash + fileExtension);
  },
};

export const defaultUploadConfig: MulterOptions = {
  storage: diskStorage(defaultDiskStorageConfig),
};
